/*var request = window.indexedDB.open("model-storage");
request.onerror = function(event) {
  alert("Why didn't you allow my web app to use IndexedDB?!");
};

request.onsuccess = function(event) {
    db = request.result;
    let transaction = db.transaction(["group-metadata"], "readwrite");//,"participant"
    let objectStore = transaction.objectStore("customers");
    console.log(transaction);

    
};
*/

function getAllGenerico(db,callback,tableName){
    let transaction = db.transaction([tableName]);
    let objectStore = transaction.objectStore(tableName);

    //console.log("objectStore",objectStore);

    let requestLocal = objectStore.getAll();

    requestLocal.onerror = function(event) {
        console.log("Error",event);
    };
    requestLocal.onsuccess = function(event) {
        let participants = event.target.result;
        callback(participants);
    }
}

function getParticipants(db,callback){
    getAllGenerico(db,callback,"participant");
}

function getGroupMetaData(db,callback){
    getAllGenerico(db,callback,"group-metadata");
}

function getContacts(db,callback){
    getAllGenerico(db,callback,"contact");
}

function exportToExcel(participants){
    var htmls = "";
    var uri = 'data:application/vnd.ms-excel;base64,';
    var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'; 
    var base64 = function(s) {
        return window.btoa(unescape(encodeURIComponent(s)))
    };
    
    var format = function(s, c) {
        return s.replace(/{(\w+)}/g, function(m, p) {
            return c[p];
        })
    };
    
    htmls = "<table>";
    participants.map(participant =>{
        htmls += "<tr><td>" + participant + "</td></tr>";    
    });    
    htmls += "<table>";
    
    var ctx = {
        worksheet : 'participants',
        table : htmls
    }
    
    
    var link = document.createElement("a");
    link.download = "participant.xls";
    link.href = uri + base64(format(template, ctx));
    link.click();
}

function exportarContactosGrupo(nombreGrupo){

    let openRequest = indexedDB.open("model-storage");
    openRequest.onupgradeneeded = function() {};
    openRequest.onerror = function() {
      console.error("Error", openRequest.error);
    };
    
    openRequest.onsuccess = function() {
        let db = openRequest.result;
        //console.log("db",db);
        getGroupMetaData(db,function(groupMetaDatas){
            let groupMetaData = groupMetaDatas.filter(a => a.subject == nombreGrupo)[0];
            //console.log(groupMetaData);

            getContacts(db,function(contacts){
                //console.log(contacts.filter(a => a.name != null && a.name.toLocaleLowerCase().indexOf("americo")>-1));
            });

            getParticipants(db,function(originParticipants){
                let participants = originParticipants.filter(a => a.groupId == groupMetaData.id)[0];
                participants = participants.participants;
                participants = participants.map(e => e.split("@")[0])

                console.log(participants);

                exportToExcel(participants);
            });
        });
        
    };

}

let NAME_GROUP = "";

exportarContactosGrupo(NAME_GROUP);

console.log("");
