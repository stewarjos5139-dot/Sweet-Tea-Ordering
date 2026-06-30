/**
 * 甜趣奶茶 - 分类页逻辑
 */
$(function(){

  var currentId=0;
  var emojis=['🍋','🧋','☕','🍟'];
  var sidebarIcons=['fa-lemon-o','fa-coffee','fa-moon-o','fa-cutlery'];

  function loadCats(){
    $.ajax({url:'/api/categories',type:'GET',dataType:'json',success:function(res){
      if(res.code===200&&res.data){
        $.each(res.data,function(i,c){
          var icon = sidebarIcons[i]||'fa-tag';
          $('#catSidebar').append(
            '<div class="cs-item" data-id="'+c.id+'"><span class="cs-icon"><i class="fa '+icon+'"></i></span>'+esc(c.name)+'</div>'
          );
        });
        var p=new URLSearchParams(location.search);
        if(p.get('cid'))switchCat(parseInt(p.get('cid'),10));
        else loadProducts(0);
      }
    }});
  }

  function loadProducts(cid){
    $('#catGrid').html('<div class="empty-state"><div class="es-icon">☕</div><p>正在加载…</p></div>');
    $.ajax({url:'/api/categories/'+cid+'/products',type:'GET',dataType:'json',success:function(res){
      if(res.code===200&&res.data&&res.data.length>0)renderProducts(res.data,cid);
      else $('#catGrid').html('<div class="empty-state"><div class="es-icon">📭</div><p>该分类暂无商品</p></div>');
    },error:function(){$('#catGrid').html('<div class="empty-state"><div class="es-icon">⚠️</div><p>加载失败</p></div>')}});
  }

  function renderProducts(products,cid){
    var name = cid===0?'全部商品':$('#catSidebar .cs-item[data-id="'+cid+'"]').text().trim();
    $('#catMainTitle').text(name+'（'+products.length+' 件）');
    var $g=$('#catGrid');$g.empty();
    $.each(products,function(i,p){
      var emoji = emojis[(p.categoryId-1)%emojis.length]||'🍵';
      var img=p.imageUrl||'';
      $g.append(
        '<div class="product-card" onclick="location.href=\'detail.html?id='+p.id+'\'">'+
          '<div class="pc-img-wrap">'+
            '<img src="'+img+'" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<div style=width:100%;height:200px;display:flex;align-items:center;justify-content:center;font-size:64px>'+emoji+'</div>\'">'+
            (p.isRecommend?'<span class="pc-badge pc-badge-hot">推荐</span>':'')+
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

  function switchCat(id){
    currentId=id;
    $('#catSidebar .cs-item').each(function(){$(this).toggleClass('active',parseInt($(this).data('id'))===id)});
    loadProducts(id);
  }

  $('#catSidebar').on('click','.cs-item',function(){
    var id=parseInt($(this).data('id'),10);
    if(!isNaN(id))switchCat(id);
  });

  function esc(s){var d=document.createElement('div');d.appendChild(document.createTextNode(s));return d.innerHTML}
  $(window).on('scroll',function(){$('#mainHeader').toggleClass('scrolled',$(window).scrollTop()>10)});

  loadCats();
});
