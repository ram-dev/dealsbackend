

function Repository(){
    this.dbs = [];
};

Repository.prototype.add = function(name, db) {
    if( !db ){
        throw new Error("need a name or database");
    }

    this.dbs[name] = db;
}

Repository.prototype.get = function(name){
    return this.dbs[name];
}


module.exports = new Repository();