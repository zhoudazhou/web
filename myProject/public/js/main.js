
$(window).scroll(function(){
    var scrollHeight = $(this).scrollTop();
    console.log(scrollHeight+"-----");
    if(scrollHeight > 400){
        console.log("-----");
        $(".mytitle").addClass("on");
    }
})
$(function(){
    let myheight = $("body").height();
   
});