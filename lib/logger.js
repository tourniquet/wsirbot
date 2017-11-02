function Logger(){
    this.info = "INFO";
    this.error = "ERROR";
    this.warn = "WARN";
}

Logger.prototype.time = function(){
    let date = new Date();
    let year = date.getFullYear();
    let month =  date.getMonth()+1;
    let day = date.getDate();
    let time = date.toTimeString().substring(0,date.toTimeString().indexOf(' '));

    let fulldate = year + "-"+month+ "-"+day + "-" + time;
    return fulldate;
}

Logger.prototype.log = function(type,msg){
    let time_now = this.time();
    console.log(time_now,type,msg);
}

console.log('Logger initialize');

module.exports = Logger;