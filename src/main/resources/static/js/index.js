/**
 * 甜趣奶茶 - 首页逻辑
 */
$(function(){

  var hotEmojis = ['🧋','🍵','🥤','🧊','🍋','🫧','🍑','🍇','☕'];

  function loadRecommend(){
    $.ajax({
      url:'/api/index/recommend',type:'GET',dataType:'json',
      success:function(res){
        if(res.code===200&&res.data&&res.data.length>0) renderRecommend(res.data);
        else $('#recommendGrid').html('<div class="empty-state"><div class="es-icon">📭</div><p>暂无推荐商品</p></div>');
      },
      error:function(){
        $('#recommendGrid').html('<div class="empty-state"><div class="es-icon">⚠️</div><p>加载失败，请检查网络</p></div>');
      }
    });
  }

  function renderRecommend(products){
    var $g = $('#recommendGrid');$g.empty();
    $.each(products,function(i,p){
      var emoji = hotEmojis[i%hotEmojis.length];
      var img = p.imageUrl||'';
      $g.append(
        '<div class="product-card" onclick="location.href=\'detail.html?id='+p.id+'\'">'+
          '<div class="pc-img-wrap">'+
            '<img src="'+img+'" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<div style=width:100%;height:200px;display:flex;align-items:center;justify-content:center;font-size:64px>'+emoji+'</div>\'" alt="'+esc(p.name)+'">'+
            '<span class="pc-badge pc-badge-hot">HOT</span>'+
          '</div>'+
          '<div class="pc-body">'+
            '<div class="pc-name">'+esc(p.name)+'</div>'+
            '<div class="pc-desc">'+esc(p.description||'')+'</div>'+
            '<div class="pc-footer">'+
              '<div class="pc-price"><span class="symbol">¥</span>'+p.price.toFixed(2)+'</div>'+
              '<button class="pc-btn" onclick="event.stopPropagation();location.href=\'detail.html?id='+p.id+'\'">去下单</button>'+
            '</div>'+
          '</div>'+
        '</div>'
      );
    });
  }

  function esc(s){var d=document.createElement('div');d.appendChild(document.createTextNode(s));return d.innerHTML}

  // sticky header shadow
  $(window).on('scroll',function(){
    $('#mainHeader').toggleClass('scrolled',$(window).scrollTop()>10);
  });

  loadRecommend();
});
