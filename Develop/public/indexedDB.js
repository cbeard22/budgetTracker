export function checkForIndexedDb() {
    if (!window.indexedDB) {
        console.log("Your browser doesn't support a stable version of IndexedDB.");
        return false;
    }
    return true;
}

export function useIndexedDb(databaseName, storeName, method, object) {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(databaseName, 1);
        let database;

        const request = indexedDB.open("budget", 1);

        request.onupgradeneeded = function (e) {
            let database = target.result;
            database.createObjectStore(storeName, { autoIncrement: true });
        };

        request.onsuccess = function (e) {
            database = target.result;
            if (navigator.onLine){
                checkDatabase();
            }
        };

        request.onerror = function (e) {
            console.log("There was an error");
        };

        function saveRecord(record) {
            database = request.results;
            const transaction = database.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);

            store.add(record)
        }

        function checkDatabase() {
            const transaction = database.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);
            const getAll = store.getAll();

            getAll.onsuccess = function () {
                if (getAll.result.length > 0) {
                    fetch("api/transaction/bulk", {
                        method: "POST",
                        body: JSON.stringify(getAll.result),
                        headers: {
                            Accept: "application/json, text/plain, */*",
                            "Content-type": "application.json"
                        }
                    })
                        .then(response => {
                            return response.json();
                        })
                        .then(() => {
                            const transaction = database.transaction([storeName, "readwrite"]);
                            const store = transaction.objectStore(storeName);
                            store.clear();
                        })
                }
            };
        }
    })
};
window.addEventListener("online", checkDatabase);