var m_mydata = null;
var m_currentIndex = 0;
var m_maxIndex = 0;
//ajax
function sendMessage(cb){
     var xmlhttp;
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
         xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
         xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
         xmlhttp.onreadystatechange=function()
    {
    if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            cb&&cb(JSON.parse(xmlhttp.response) );
        }
    }
    xmlhttp.open("GET","/hello",true);
    xmlhttp.send();

}
function getMyList(data){
    m_mydata = data;
   m_maxIndex = Math.floor(data.length / 8) ;

    if(data.length == 0 ){
        return ;
    }
     $(".message").empty();

    for(let item in data){
        if(item == 8){
            break;
        }
        let txt ='<div class="message_content">'
            +'<p class="mes">'+data[item].text+'</p>'
            +'<p class="name">'+data[item].name+'</p>'
            +'<button class="mybtn"></button>'
            +'<div class="zan">'
             + '<span class="zan_num">'+data[item].num+'</span>'
              +'<span class="zhan_text">赞</span>'
            +'</div>'
          +'</div>';
        
        $(".message").append(txt);  
    }
    var num =Math.floor(data.length / 8) ;
   
    num++;
    var num2 = data.length % 8;
    if(num != 1 && num2 > 0){
        num++;
    }
    let tempNum = 0;
    if(num < 5){
        tempNum = num;
    }else{
        tempNum = 5;
    }
    $(".control").empty();
    let mypage = '<span class="page-prev">上一页</span>'
         +'<span class="page-first">首页</span>';
         for(let i=0;i<tempNum;i++){
           mypage+= '<span class="mypageBtn">'+(i+1)+'</span>';
         }
        mypage += '<span class="next">下一页</span>'
         +'<span class="page-end">尾页</span>';
    
    $(".control").append(mypage);
     $(".control span").click(function(tag){
         console.log("tag = ",tag.target.innerText);
        clickedMessage(tag.target.innerText);
   }); 
  
     
}
function clickedMessage(data){
     console.log("clickedMessage");
    if(data == "上一页"){
        if(m_currentIndex == 0)
        return;
        m_currentIndex--;

    }else if(data == "首页"){
        m_currentIndex =1;
    }else if(data == "下一页"){
        if(m_currentIndex == m_maxIndex){
            return;
        }
    }else if(data == "尾页"){
        m_currentIndex = m_maxIndex;
    }else{
        let num = parseInt(data);
        m_currentIndex = num-1;
    }
    console.log("clickedMessage");
    showMessage();
}
function showMessage(){
    console.log("showMessage");
    $(".message").empty();
    let temp = (m_currentIndex > 0)?(8*m_currentIndex-1) : 0;
    for(let i=temp;i<temp+8;i++){
        if(m_mydata[i])
        {
            let txt ='<div class="message_content">'
            +'<p class="mes">'+m_mydata[i].text+'</p>'
            +'<p class="name">'+m_mydata[i].name+'</p>'
            +'<button class="mybtn"></button>'
            +'<div class="zan">'
            + '<span class="zan_num">'+m_mydata[i].num+'</span>'
            +'<span class="zhan_text">赞</span>'
            +'</div>'
            +'</div>';
            $(".message").append(txt);  
        }
    }
    if(m_mydata.length > 40){

    }else{

    }

}
$(window).scroll(function(){
    var scrollHeight = $(this).scrollTop();
    console.log(scrollHeight+"-----");
    if(scrollHeight > 400){
        console.log("-----");
        $(".mytitle").addClass("on");
    }
})

$(function(){
   
   sendMessage(getMyList);
  
});
