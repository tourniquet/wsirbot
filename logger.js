function Logger(){
    console.log('Logger initialize');
    this.info = "INFO";
    this.error = "ERROR";
    this.warn = "WARN";
}

Logger.prototype.time = function(){
    let date = new Date();
    let year = date.getFullYear();
    let month =  date.getMonth()+1;
    let day = date.getDate();
    let time = year + "-"+month+ "-"+day;
    return time;
}

Logger.prototype.log = function(type,msg){
    let time_now = this.time();
    console.log(type,time_now,msg);
}

module.exports = Logger;