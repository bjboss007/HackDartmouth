FileTable = new Meteor.Collection('fileTable');

Template.UI.helpers({
    docItems: function(){
        return FileTable.find().fetch();
    }
});



Template.UI.events({
    'click .btnDownload': function(event, template){
        var ary = (this._parts.map(function(object){
           return object._partLocation; 
        }));
        console.log(ary);
        downloadAll(ary);
    } 
});


function downloadAll(files){
    if(files.length == 0) return;
    file = files.pop();
    var theAnchor = $('<a />')
        .attr('href', file)
        .attr('download',file);
    theAnchor[0].click(); 
    theAnchor.remove();
    downloadAll(files);
}