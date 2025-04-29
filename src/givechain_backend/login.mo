import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";

actor Login {
    // Tipe data LoginStatus
    public type LoginStatus = {
        #Success;
        #Failure : Text;
    };

  

    private var registeredUsers = HashMap.HashMap<Principal, Bool>(
        10,
        Principal.equal,
        Principal.hash
    );

    // Fungsi untuk menambahkan pengguna ke daftar terdaftar
    public shared(_msg) func registerUser(principal: Principal) : async Text {  
        registeredUsers.put(principal, true);
        return "Pengguna berhasil terdaftar!";
    };

    // Fungsi untuk memeriksa login
    public shared(_msg) func isUserLoggedIn(principal: Principal) : async LoginStatus {
        switch (registeredUsers.get(principal)) {
            case (null) {
                return #Failure("Pengguna tidak terdaftar.");
            };
            case (?_) {
                return #Success;
            };
        }
    };

    // Fungsi untuk login
    public shared(_msg) func loginUser(principal: Principal) : async LoginStatus {
        return await isUserLoggedIn(principal);
    };
}