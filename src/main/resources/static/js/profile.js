/**
 * 甜趣奶茶 - 个人中心逻辑
 */
$(function(){

  var user=null;

  function init(){
    $.ajax({url:'/api/user/current',type:'GET',dataType:'json',success:function(r){
      if(r.code===200&&r.data){user=r.data;showLoggedIn(user);loadOrders()}
      else showLoggedOut();
    },error:showLoggedOut});
  }

  function showLoggedIn(u){
    $('#profileName').text(u.username);
    $('#profileUsername').text('ID: '+u.id);
    $('#profileAddr').text(u.address||'📍 尚未设置收货地址');
    $('#loginPrompt').hide();$('#profileMenu').show();
    $('#orderSection').show();$('#orderEmptyHint').hide();
    $('#logoutRow').show();
  }

  function showLoggedOut(){
    $('#profileName').text('未登录');
    $('#profileUsername').text('');$('#profileAddr').text('');
    $('#loginPrompt').show();$('#profileMenu').hide();
    $('#orderSection').hide();$('#orderEmptyHint').show();
    $('#logoutRow').hide();
  }

  function loadOrders(){
    $.ajax({url:'/api/orders/my',type:'GET',dataType:'json',success:function(r){
      if(r.code===200&&r.data&&r.data.length>0)renderOrders(r.data);
      else $('#orderList').html('<div class="empty-state"><div class="es-icon">🧋</div><p>暂无订单，快去点一杯吧~</p></div>');
    },error:function(){$('#orderList').html('<div class="empty-state"><div class="es-icon">⚠️</div><p>加载失败</p></div>')}});
  }

  function renderOrders(orders){
    var $c=$('#orderList');$c.empty();
    $.each(orders,function(i,o){
      var statusText=o.status==='pending'?'待处理':o.status==='done'?'已完成':o.status;
      var statusCls=o.status==='pending'?'oc-status-pending':o.status==='done'?'oc-status-done':'oc-status-cancel';
      var html='<div class="order-card">';
      html+='<div class="oc-top"><span class="oc-time">🕐 '+esc(o.createTime||'')+'</span><span class="oc-status-badge '+statusCls+'">'+esc(statusText)+'</span></div>';
      html+='<div class="oc-items-list">';
      if(o.items&&o.items.length){
        $.each(o.items,function(j,item){
          html+='<div class="oci-row">'+
            '<img src="'+(item.productImageUrl||'')+'" onerror="this.style.background=\'var(--color-primary-pale)\';this.style.display=\'block\'">'+
            '<div class="oci-name">'+esc(item.productName||'商品')+'<div class="oci-specs">'+esc(item.sweetness||'')+' / '+esc(item.iceLevel||'')+'</div></div>'+
            '<span class="oci-qty">×'+item.quantity+'</span>'+
            '<span class="oci-price">¥'+(item.productPrice*item.quantity).toFixed(2)+'</span>'+
          '</div>';
        });
      }
      html+='</div>';
      html+='<div class="oc-footer"><span class="ocf-label">合计</span><span class="ocf-total">¥'+o.totalPrice.toFixed(2)+'</span></div>';
      html+='</div>';
      $c.append(html);
    });
  }

  function esc(s){var d=document.createElement('div');d.appendChild(document.createTextNode(s));return d.innerHTML}

  $('#btnLogout').click(function(){
    if(!confirm('确定要退出登录吗？'))return;
    $.ajax({url:'/api/user/logout',type:'POST',dataType:'json',success:function(){
      user=null;showLoggedOut();$('#orderList').empty();location.href='index.html';
    },error:function(){alert('退出失败')}});
  });

  $(window).on('scroll',function(){$('#mainHeader').toggleClass('scrolled',$(window).scrollTop()>10)});
  init();
});
