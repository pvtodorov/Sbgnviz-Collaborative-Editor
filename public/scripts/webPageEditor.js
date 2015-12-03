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


});

function showQTip(el){
    $(el).parent().qtip({
        content: { text:  function() {
            return "Click image to enlarge";
        }

        },

        position: {
            my: 'center',
            at: 'center',
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
}

function openImage(el){
    if(el.src){
        var url = el.src;
        window.open(url, 'Image', 'width=largeImage.stylewidth,height=largeImage.style.height,resizable=1');
    }


}



function scrollToBottom(docId){
    document.getElementById(docId).scrollTop = document.getElementById(docId).scrollHeight;

}