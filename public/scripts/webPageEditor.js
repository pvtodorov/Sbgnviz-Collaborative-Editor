/**
 * Created by funda on 11/17/15.
 */
        // Create the tooltips only on document load

//TODO image qtip is not working
$(document).ready(function() {


    scrollToBottom('messages');
    scrollToBottom('command-history-area');

    window.onresize = function() {
        scrollToBottom('messages');
        scrollToBottom('command-history-area');
    }();



    $('#command-history-area').live('contentchanged', function(){
        scrollToBottom('command-history-area');

    });

    $('#messages').live('contentchanged', function(){
        scrollToBottom('messages');

    });



    // Match all link elements with href attributes within the content div
    $('#receivedImage').qtip({
        content: { text:  function() {
            if ($('#receivedImage img')[0] != null) {
                return "Click to enlarge";
            }
            else
                return "";
        }

        },

        position: {
            my: 'top center',
            at: 'top center',
            adjust: {
                cyViewport: true
            },
            effect: false
        },
        mouseover: true,
        style: {
            classes: 'qtip-image',

            tip: {
                width: 16,
                height: 8
            }
        }
    });
});

function openImage(){
    var largeImage = $('#receivedImage')[0];
    if( $('#receivedImage img')[0] !=null) {
        var url = $('#receivedImage img')[0].src;
        window.open(url, 'Image', 'width=largeImage.stylewidth,height=largeImage.style.height,resizable=1');
    }
}



function scrollToBottom(docId){
    document.getElementById(docId).scrollTop = document.getElementById(docId).scrollHeight;

}
