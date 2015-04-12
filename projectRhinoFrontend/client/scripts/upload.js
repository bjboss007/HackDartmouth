Template.upload.rendered = function(){
    $('#fileupload').fileupload({
        url: "/upload/file",
        type: "POST",
        datatype: "json",
        add: function (event, data) {
            // Submit
            data.submit();
        },
        done: function (e, data) {
            console.log(data);
        },
        progress: function(e, data){
            // This is what makes everything really cool, thanks to that callback
            // you can now update the progress bar based on the upload progress.
            var percent = Math.round((data.loaded / data.total) * 100);
            $('.bar').css('width', percent + '%');
        },
        fail: function(e, data) {
            // Remove 'unsaved changes' message.
            window.onbeforeunload = null;
        },
        success: function(data) {
            // onSuccess
        }
    });
};