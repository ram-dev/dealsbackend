Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

Date.prototype.removeDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() - days);
    return dat;
};

