/**
 * 甜趣奶茶 - 全部商品页
 */
$(function(){

  var page=1,pageSize=12,totalPages=1,loading=false,keyword='';
  var emojis=['🧋','🍵','🥤','🧊','🍋','🫧','🍑','🍇','☕','🍪','🍩','🧁'];

  function loadProducts(kw,append){
    if(loading)return;loading=true;
    var reqPage=append?page:1;
    $.ajax({
      url:'/api/products/all',type:'GET',
      data:{page:reqPage,size:pageSize,keyword:kw||''},dataType:'json',
      success:function(res){
        loading=false;
        if(res.code===200&&res.data){
          var d=res.data;totalPages=d.totalPages;page=d.page;
          if(append)appendCards(d.list);else renderCards(d.list);
          if(d.hasMore)$('#loadMoreTip').html('<span class="lm-spinner">⏳</span> 下拉加载更多…').show();
          else if(d.list.length>0)$('#loadMoreTip').text('—— 已经到底啦 ——').show();
          else $('#loadMoreTip').hide();
        }else if(!append)showEmpty();
      },
      error:function(){loading=false;if(!append)showError()}
    });
  }

  function renderCards(products){
    var $c=$('#listGrid');$c.empty();
    if(!products||!products.length){showEmpty();return}
    $.each(products,function(i,p){$c.append(card(p,i))});
  }

  function appendCards(products){$.each(products,function(i,p){$('#listGrid').append(card(p,i))})}

  function card(p,i){
    var emoji=emojis[i%emojis.length];
    var img=p.imageUrl||'';
    return '<div class="product-card" onclick="location.href=\'detail.html?id='+p.id+'\'">'+
      '<div class="pc-img-wrap">'+
        '<img src="'+img+'" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<div style=width:100%;height:200px;display:flex;align-items:center;justify-content:center;font-size:64px>'+emoji+'</div>\'">'+
        (p.isRecommend?'<span class="pc-badge pc-badge-hot">推荐</span>':'')+
      '</div>'+
      '<div class="pc-body">'+
        '<div class="pc-name">'+esc(p.name)+'</div>'+
        '<div class="pc-desc">'+esc(p.description||'')+'</div>'+
        '<div class="pc-footer">'+
          '<div class="pc-price"><span class="symbol">¥</span>'+p.price.toFixed(2)+'</div>'+
          '<button class="pc-btn" onclick="event.stopPropagation();location.href=\'detail.html?id='+p.id+'\'">下单</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }

  function showEmpty(){$('#listGrid').html('<div class="empty-state"><div class="es-icon">🔍</div><p>没有找到相关商品</p></div>')}
  function showError(){$('#listGrid').html('<div class="empty-state"><div class="es-icon">⚠️</div><p>加载失败</p></div>')}

  function esc(s){var d=document.createElement('div');d.appendChild(document.createTextNode(s));return d.innerHTML}

  $('#btnSearch').click(function(){keyword=$('#searchInput').val().trim();page=1;loadProducts(keyword,false)});
  $('#searchInput').keydown(function(e){if(e.key==='Enter'){keyword=$(this).val().trim();page=1;loadProducts(keyword,false)}});

  // scroll load more
  var st=null;
  $(window).on('scroll',function(){
    $('#mainHeader').toggleClass('scrolled',$(window).scrollTop()>10);
    if(st)clearTimeout(st);
    st=setTimeout(function(){
      if(loading||page>=totalPages)return;
      var $last=$('#listGrid .product-card').last();
      if(!$last.length)return;
      if($last.offset().top<$(window).scrollTop()+$(window).height()+200){page++;loadProducts(keyword,true)}
    },150);
  });

  loadProducts('',false);
});
