var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get("/hello",function(req, res, next){
  res.send([{name:"周大洲",num:1500,text:"中国队必胜"},
  {name:"小飞机",num:1500,text:"速度快放假施蒂利克福晶科技收到啦副科级队必胜"},
  {name:"蒋启明",num:1500,text:"水电费看见的谁离开房间的史莱克必胜"},
   {name:"蒋启明",num:1500,text:"水电费看见的谁离开房间的史莱克必胜"},
    {name:"蒋启明",num:1500,text:"水电费看见的谁离开房间的史莱克必胜"},
     {name:"蒋启明",num:1500,text:"水电费看见的谁离开房间的史莱克必胜"},
      {name:"蒋启明",num:1500,text:"水电费看见的谁离开房间的史莱克必胜"},
       {name:"蒋启明",num:1500,text:"水电费看见的谁离开房间的史莱克必胜"},
        {name:"蒋启明",num:1500,text:"水电费看见的谁离开房间的史莱克必胜"},
         {name:"蒋启明",num:1500,text:"水电费看见的谁离开房间的史莱克必胜"}]);
})

module.exports = router;
