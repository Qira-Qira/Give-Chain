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

import _Login "canister:login";

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

    // Tambahan tipe data untuk statistik
    public type DonationSummary = {
        totalDonated: Nat;
        totalContributions: Nat;
        casesSupported: [Nat];
    };

    public type RequestStatistics = {
        totalPending: Nat;
        totalApproved: Nat;
        totalRejected: Nat;
        totalCompleted: Nat;
        totalFundsRaised: Nat;
    };

    public type WeeklyDonation = {
        weekStart: Time.Time;
        totalAmount: Nat;
        donationCount: Nat;
    };

    func hashNat(n: Nat) : Hash.Hash {
    let prime : Nat32 = 4294967291; // Bilangan prima besar < 2^32
    Nat32.fromNat(n % Nat32.toNat(prime))
};

    // State variables
    private stable var nextRequestId: Nat = 1;
    private var requests = HashMap.HashMap<Nat, Request>(0, Nat.equal, hashNat);
    private var votes = HashMap.HashMap<Text, Vote>(0, Text.equal, Text.hash);
    private var _donations = HashMap.HashMap<Text, Donation>(0, Text.equal, Text.hash);
    private var auditLog = Buffer.Buffer<AuditEvent>(0);
    private var _weeklyDonations = HashMap.HashMap<Text, WeeklyDonation>(0, Text.equal, Text.hash);
    private var _notifications = HashMap.HashMap<Principal, Buffer.Buffer<AuditEvent>>(0, Principal.equal, Principal.hash);
    
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
        for (member in _DAO_MEMBERS.vals()) {
            if (member == _user) {
                return true;
            };
        };
        return false;
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

    // Fungsi untuk memperbarui permintaan bantuan
    public shared(msg) func updateRequest(
        requestId: Nat,
        title: Text,
        description: Text,
        category: Text,
        proofUrl: Text
    ) : async Result.Result<Nat, Text> {
        let caller = msg.caller;
        
        switch (requests.get(requestId)) {
            case (null) {
                return #err("Request not found");
            };
            case (?request) {
                // Only allow updates if status is Pending
                if (request.status != #Pending) {
                    return #err("Can only edit pending requests");
                };
                
                // Only owner can update
                if (request.owner != caller) {
                    return #err("Only the owner can edit this request");
                };

                // Create updated request
                let updatedRequest : Request = {
                    request with
                    title = title;
                    description = description;
                    category = category;
                    proofUrl = proofUrl;
                };

                // Save updated request
                requests.put(requestId, updatedRequest);
                
                // Log audit
                logEvent("REQUEST_UPDATED", caller, "Request ID: " # Nat.toText(requestId));
                
                return #ok(requestId);
            };
        };
    };

    // Fungsi untuk mendapatkan riwayat donasi pengguna
    public query(msg) func getDonationSummary() : async DonationSummary {
        let caller = msg.caller;
        var totalDonated: Nat = 0;
        var contributions: Nat = 0;
        let supportedCases = Buffer.Buffer<Nat>(0);

        for ((_, donation) in _donations.entries()) {
            if (donation.donor == caller) {
                totalDonated += donation.amount;
                contributions += 1;
                supportedCases.add(donation.requestId);
            };
        };

        {
            totalDonated = totalDonated;
            totalContributions = contributions;
            casesSupported = Buffer.toArray(supportedCases);
        }
    };

    // Fungsi untuk mendapatkan statistik request
    public query func getRequestStatistics() : async RequestStatistics {
        var pending: Nat = 0;
        var approved: Nat = 0;
        var rejected: Nat = 0;
        var completed: Nat = 0;
        var totalRaised: Nat = 0;

        for ((_, request) in requests.entries()) {
            switch (request.status) {
                case (#Pending) { pending += 1 };
                case (#Approved) { approved += 1 };
                case (#Rejected) { rejected += 1 };
                case (#Completed) { completed += 1 };
            };
            totalRaised += request.amountRaised;
        };

        {
            totalPending = pending;
            totalApproved = approved;
            totalRejected = rejected;
            totalCompleted = completed;
            totalFundsRaised = totalRaised;
        }
    };

    // Fungsi untuk mendapatkan donasi per minggu
    public query func getWeeklyDonations(startTime: Time.Time, endTime: Time.Time) : async [WeeklyDonation] {
        let result = Buffer.Buffer<WeeklyDonation>(0);
        
        for ((_, donation) in _donations.entries()) {
            if (donation.timestamp >= startTime and donation.timestamp <= endTime) {
                // Implementasi logika pengelompokan per minggu
                // ...
            };
        };

        Buffer.toArray(result)
    };

    // Fungsi untuk mendapatkan notifikasi user
    public query(msg) func getUserNotifications() : async [AuditEvent] {
        let caller = msg.caller;
        var userNotifications = Buffer.Buffer<AuditEvent>(0);

        for (event in auditLog.vals()) {
            if (event.user == caller or 
                (event.eventType == "REQUEST_APPROVED" or 
                 event.eventType == "REQUEST_REJECTED" or
                 event.eventType == "DONATION_RECEIVED")) {
                userNotifications.add(event);
            };
        };

        Buffer.toArray(userNotifications)
    };

    // Fungsi untuk mendapatkan audit log terstruktur
    public query func getStructuredAuditLog(
        eventType: ?Text,
        startTime: ?Time.Time,
        endTime: ?Time.Time,
        userPrincipal: ?Principal
    ) : async [AuditEvent] {
        let filtered = Buffer.Buffer<AuditEvent>(0);

        for (event in auditLog.vals()) {
            var include = true;

            switch(eventType) {
                case (?et) { 
                    if (event.eventType != et) { include := false };
                };
                case null {};
            };

            switch(startTime) {
                case (?st) { 
                    if (event.timestamp < st) { include := false };
                };
                case null {};
            };

            switch(endTime) {
                case (?et) { 
                    if (event.timestamp > et) { include := false };
                };
                case null {};
            };

            switch(userPrincipal) {
                case (?up) { 
                    if (event.user != up) { include := false };
                };
                case null {};
            };

            if (include) {
                filtered.add(event);
            };
        };

        Buffer.toArray(filtered)
    };

    // TODO: Implementasi fungsi donasi dan penarikan dana
    // Catatan: Untuk metode ini kita memerlukan integrasi dengan token ICP untuk transaksi
    // yang akan diimplementasikan pada fase berikutnya.

};