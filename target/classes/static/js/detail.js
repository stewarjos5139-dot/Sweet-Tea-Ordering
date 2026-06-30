/**
 * 甜趣奶茶 - 商品详情与下单
 */
$(function(){

  var productId=null, productPrice=0, productStock=0, quantity=1, sweetness='全糖', iceLevel='正常';

  var p=new URLSearchParams(location.search);
  var id=p.get('id');
  if(!id){toast('商品不存在');return}
  productId=parseInt(id,10);

  function loadDetail(){
    $.ajax({url:'/api/products/'+productId,type:'GET',dataType:'json',success:function(res){
      if(res.code===200&&res.data)render(res.data);else toast('商品不存在或已下架');
    },error:function(){toast('加载失败')}});
  }

  function render(p){
    productPrice=p.price;productStock=p.stock;
    $('#detailName').text(p.name);
    $('#detailDesc').text(p.description||'暂无描述');
    $('#detailPrice').text(p.price.toFixed(2));
    $('#detailStock').text('库存：'+p.stock+' 杯');
    var cats=['','果茶','奶茶','咖啡','小食'];
    $('#detailCategory').text(cats[p.categoryId]||'饮品');

    var img=p.imageUrl||'';
    if(img){$('#detailImg').attr('src',img).on('error',function(){
      $(this).parent().html('<div style=font-size:120px>🧋</div>');
    })}else{$('#detailImg').parent().html('<div style=font-size:120px>🧋</div>')}

    updateTotal();
  }

  $('#sweetnessOpts').on('click','.spec-opt',function(){
    $('#sweetnessOpts .spec-opt').removeClass('active');$(this).addClass('active');
    sweetness=$(this).data('val');
  });
  $('#iceOpts').on('click','.spec-opt',function(){
    $('#iceOpts .spec-opt').removeClass('active');$(this).addClass('active');
    iceLevel=$(this).data('val');
  });

  $('#btnMinus').click(function(){
    if(quantity>1){quantity--;$('#qtyNum').text(quantity);updateTotal();$('#btnMinus').prop('disabled',quantity<=1)}
  });
  $('#btnPlus').click(function(){
    if(quantity<productStock){quantity++;$('#qtyNum').text(quantity);updateTotal();$('#btnMinus').prop('disabled',false)}
    else toast('库存不足，当前库存：'+productStock);
  });

  function updateTotal(){$('#totalPrice').text((productPrice*quantity).toFixed(2))}

  window.submitOrder=function(){
    $.ajax({url:'/api/user/current',type:'GET',dataType:'json',success:function(r){
      if(r.code!==200){toast('请先登录');setTimeout(function(){location.href='login.html?redirect=detail.html?id='+productId},1200);return}
      doCreate();
    }});
  };

  function doCreate(){
    $('#btnSubmit').prop('disabled',true).text('提交中…');
    $.ajax({
      url:'/api/orders/create',type:'POST',contentType:'application/json',
      data:JSON.stringify({items:[{productId:productId,quantity:quantity,sweetness:sweetness,iceLevel:iceLevel}]}),
      dataType:'json',success:function(res){
        $('#btnSubmit').prop('disabled',false).text('立即下单');
        if(res.code===200){toast('✅ 下单成功！订单号：'+res.data.orderId);setTimeout(function(){location.reload()},1500)}
        else if(res.code===401){toast('请先登录');setTimeout(function(){location.href='login.html'},1200)}
        else toast(res.message||'下单失败');
      },error:function(){$('#btnSubmit').prop('disabled',false).text('立即下单');toast('网络错误')}
    });
  }

  function toast(m){
    var $t=$('#toast');$t.text(m).fadeIn(200);
    clearTimeout($t.data('t'));$t.data('t',setTimeout(function(){$t.fadeOut(300)},1800));
  }

  $(window).on('scroll',function(){$('#mainHeader').toggleClass('scrolled',$(window).scrollTop()>10)});
  loadDetail();
});
