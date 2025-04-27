// import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
// import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
// import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Bool "mo:base/Bool";
import Nat32 "mo:base/Nat32";

actor EmergencyDonations {
    // Tipe data untuk permintaan bantuan
    public type RequestStatus = {
        #Pending;     // Menunggu voting
        #Approved;    // Disetujui, siap menerima donasi
        #Rejected;    // Ditolak oleh DAO
        #Completed;   // Donasi sudah disalurkan
    };

    public type Request = {
        id: Nat;
        owner: Principal;
        title: Text;
        description: Text;
        category: Text;
        proofUrl: Text;
        amountRequested: Nat;  // Dalam satuan ICP (x 10^8)
        amountRaised: Nat;     // Jumlah yang sudah terkumpul
        recipientAddress: Principal;
        createdAt: Time.Time;
        votesFor: Nat;
        votesAgainst: Nat;
        status: RequestStatus;
        votingEndTime: Time.Time;
    };

    // Tipe data untuk vote
    public type Vote = {
        voter: Principal;
        requestId: Nat;
        support: Bool;    // true = mendukung, false = menolak
        timestamp: Time.Time;
    };

    // Tipe data untuk donasi
    public type Donation = {
        donor: Principal;
        requestId: Nat;
        amount: Nat;
        timestamp: Time.Time;
    };

    // Tipe data untuk audit log
    public type AuditEvent = {
        timestamp: Time.Time;
        eventType: Text;
        user: Principal;
        details: Text;
    };

    func hashNat(n: Nat) : Hash.Hash {
    let prime : Nat32 = 4294967291; // Bilangan prima besar < 2^32
    Nat32.fromNat(n % Nat32.toNat(prime))
};

    // State variables
    private stable var nextRequestId: Nat = 1;
    private var requests = HashMap.HashMap<Nat, Request>(0, Nat.equal, hashNat);
    private var votes = HashMap.HashMap<Text, Vote>(0, Text.equal, Text.hash);
    private var EmergencyDonations = HashMap.HashMap<Text, Donation>(0, Text.equal, Text.hash);
    private var auditLog = Buffer.Buffer<AuditEvent>(0);
    
    // Konstanta
    private let VOTING_PERIOD_NS: Nat = 172800000000000; // 48 jam dalam nanosekon
    private let VOTING_THRESHOLD: Float = 0.6; // 60% suara untuk disetujui
    private let _DAO_MEMBERS: [Principal] = [
        // Daftar principal IDs dari anggota DAO, akan diisi pada implementasi sebenarnya
        // Contoh: Principal.fromText("xi2f3-vyaaa-aaaaa-aaapa-cai")
    ];

    // Fungsi untuk mengajukan permintaan bantuan darurat
    public shared(msg) func submitRequest(
        title: Text, 
        description: Text, 
        category: Text,
        proofUrl: Text, 
        amountRequested: Nat,
        recipientAddress: Principal
    ) : async Result.Result<Nat, Text> {
        
        let caller = msg.caller;
        
        // Validasi input
        if (Text.size(title) < 5) {
            return #err("Judul terlalu pendek");
        };
        
        if (Text.size(description) < 20) {
            return #err("Deskripsi terlalu pendek");
        };
        
        if (Text.size(proofUrl) < 5) {
            return #err("URL bukti tidak valid");
        };
        
        if (amountRequested == 0) {
            return #err("Jumlah yang diminta harus lebih dari 0");
        };
        
        // Buat request baru
        let newRequest: Request = {
            id = nextRequestId;
            owner = caller;
            title = title;
            description = description;
            category = category;
            proofUrl = proofUrl;
            amountRequested = amountRequested;
            amountRaised = 0;
            recipientAddress = recipientAddress;
            createdAt = Time.now();
            votesFor = 0;
            votesAgainst = 0;
            status = #Pending;
            votingEndTime = Time.now() + VOTING_PERIOD_NS;
        };
        
        // Simpan request
        requests.put(nextRequestId, newRequest);
        
        // Log audit
        logEvent("REQUEST_SUBMITTED", caller, "Request ID: " # Nat.toText(nextRequestId));
        
        // Increment ID for next request
        let currentId = nextRequestId;
        nextRequestId += 1;
        
        return #ok(currentId);
    };

    // Fungsi untuk memberikan suara pada permintaan
    public shared(msg) func voteRequest(requestId: Nat, support: Bool) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        // Validasi voter adalah anggota DAO
        if (not isDAOMember(caller)) {
            return #err("Hanya anggota DAO yang dapat memberikan suara");
        };
        
        // Cek apakah request ada
        switch (requests.get(requestId)) {
            case (null) {
                return #err("Request tidak ditemukan");
            };
            case (?request) {
                // Cek status request
                if (request.status != #Pending) {
                    return #err("Hanya request dengan status pending yang dapat divoting");
                };
                
                // Cek waktu voting sudah berakhir atau belum
                if (Time.now() > request.votingEndTime) {
                    return #err("Periode voting telah berakhir");
                };
                
                // Cek apakah voter sudah pernah vote sebelumnya
                let voteKey = Principal.toText(caller) # ":" # Nat.toText(requestId);
                switch (votes.get(voteKey)) {
                    case (?_) {
                        return #err("Anda sudah memberikan suara untuk request ini");
                    };
                    case (null) {
                        // Rekam vote
                        let newVote: Vote = {
                            voter = caller;
                            requestId = requestId;
                            support = support;
                            timestamp = Time.now();
                        };
                        votes.put(voteKey, newVote);
                        
                        // Update jumlah vote pada request
                        var updatedRequest = request;
                        if (support) {
                            updatedRequest := {
                                request with
                                votesFor = request.votesFor + 1
                            };
                        } else {
                            updatedRequest := {
                                request with
                                votesAgainst = request.votesAgainst + 1
                            };
                        };
                        
                        // Periksa apakah threshold voting tercapai
                        let totalVotes = updatedRequest.votesFor + updatedRequest.votesAgainst;
                        if (totalVotes >= 3) { // Minimal 3 votes untuk pengambilan keputusan
                            let approvalRate : Float = Float.fromInt(updatedRequest.votesFor) / Float.fromInt(totalVotes);
                            if (approvalRate >= VOTING_THRESHOLD) {
                                updatedRequest := {
                                    updatedRequest with
                                    status = #Approved
                                };
                                logEvent("REQUEST_APPROVED", caller, "Request ID: " # Nat.toText(requestId));
                            } else if (Float.fromInt(updatedRequest.votesAgainst) / Float.fromInt(totalVotes) > 0.5) {
                                // Jika lebih dari 50% menolak, status menjadi Rejected
                                updatedRequest := {
                                    updatedRequest with
                                    status = #Rejected
                                };
                                logEvent("REQUEST_REJECTED", caller, "Request ID: " # Nat.toText(requestId));
                            };
                        };
                        
                        // Simpan request yang diupdate
                        requests.put(requestId, updatedRequest);
                        
                        // Log audit
                        logEvent("VOTE_CAST", caller, "Request ID: " # Nat.toText(requestId) # ", Support: " # Bool.toText(support));
                        
                        return #ok();
                    };
                };
            };
        };
    };

    // Fungsi untuk mendapatkan daftar semua request
    public query func getAllRequests() : async [Request] {
        Iter.toArray(requests.vals())
    };

    // Fungsi untuk mendapatkan detail request berdasarkan ID
    public query func getRequest(requestId: Nat) : async ?Request {
        requests.get(requestId)
    };

    // Fungsi untuk mendapatkan log audit
    public query func getAuditLog() : async [AuditEvent] {
        Buffer.toArray(auditLog)
    };

    // Fungsi helper untuk memeriksa apakah principal adalah anggota DAO
    private func isDAOMember(_user: Principal) : Bool {
        // Logika untuk verifikasi keanggotaan DAO
        // Pada implementasi nyata, ini akan memeriksa dari daftar DAO_MEMBERS
        // Untuk sementara, kita biarkan semua pengguna sebagai anggota DAO untuk pengujian
        return true;
    };

    // Fungsi helper untuk mencatat event audit
    private func logEvent(eventType: Text, user: Principal, details: Text) {
        let event: AuditEvent = {
            timestamp = Time.now();
            eventType = eventType;
            user = user;
            details = details;
        };
        auditLog.add(event);
    };

    // TODO: Implementasi fungsi donasi dan penarikan dana
    // Catatan: Untuk metode ini kita memerlukan integrasi dengan token ICP untuk transaksi
    // yang akan diimplementasikan pada fase berikutnya.
};