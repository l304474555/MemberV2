const wenan = [
  '一日三省吾身，早中午吃什么？',
  '口吞天地，我要做一名嚼士',
  '零食好开胃，我爱嘎嘣脆',
  '达，则大鱼大肉，穷，也要喝茶',
  '我的血管里，流淌着白色的奶',
  '拿起杯子就能感受我的渴望',
  '和我在一起，一辈子也不会饿了',
  '每一天，爱我自己多一点',
  '年轻就要醒着拼',
  '这酸酸甜甜的滋味，像极了爱情',
  '果汁分你一半？不可能的，这辈子都不可能的',
  '别人都说我变了，其实我只是经历了些“烤”验',
  '敢爱敢当，现在就嗨起来',
  '这么顾家的我，上辈子应该是巨蟹座',
  '一天一点，筑起属于我的家',
  '我不是饿了，只是嘴巴有点寂寞',
  '天生爱玩，我是派对的宠儿',
  '没有护照，但我的胃已经走向国际',
  '除了冷屁股，就只有冷饮能浇灭我的热情',
  '微醺，是一种生活的态度',
  '我从来不说大话，因为我没有口气',
  '喜欢做运动，更喜欢和有益菌一起做运动！',
  '悄悄告诉你，我的冰箱藏着一桌满汉全席',
  '柴米油盐，我爱平淡的生活',
  '做了父母，才知道养孩子多贵，但是幸福！',
  '微醺，是一种生活的态度',
  '这一杯“甜到心里”，我先干为敬！',
  '不止是下雨天，巧克力什么时候都跟我很配',
  '擦一擦，我是洁净小卫士',
  '论吃的，我只爱新鲜的！',
  '左手一串，右手一串，属于我的下午茶时间到啦！',
  '咱们都是科技的弄潮儿',
  '把整个夏天装进杯里，午后的心情要和水一样轻盈',
  '嗝~~~这是激情在喉咙碰撞的声音',
  '如果挨一揍就能拿一个糖果，我愿意变残',
  '嘘，让我来偷偷呵护你',
  '有时灵感太快，笔都跟不上我',
  '给我5分钟，我去放松一下。',
  '天天说减肥，也就是吓吓身上的肥肉',
  '想吃就吃，不辜负我们的热血澎湃',
  '一年四季，我都喜欢夏天的感觉',
  '从里到外，从早到晚，都要保持光鲜',
  '有借无换的，大概就是借个火吧',
  '你很少使用会员特权哦，感觉错过了一个亿',
],
tempWenan = [];
wenan.forEach((item,index)=>{
  tempWenan.push({
    text: item,
    id: (index + 1)
  })
})
module.exports = {
  tempWenan
} 