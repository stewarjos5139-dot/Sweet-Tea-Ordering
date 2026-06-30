/**
 * 甜趣奶茶点单系统 - 个人中心逻辑
 * 模块5：个人中心与权限（成员5任务）
 */
$(function () {

    var currentUser = null;

    // ========== 页面初始化：检查登录状态 ==========
    function init() {
        $.ajax({
            url: '/api/user/current',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.code === 200 && res.data) {
                    // 已登录
                    currentUser = res.data;
                    showLoggedIn(currentUser);
                    loadMyOrders();
                } else {
                    // 未登录
                    showLoggedOut();
                }
            },
            error: function () {
                showLoggedOut();
            }
        });
    }

    // ========== 已登录状态 UI ==========
    function showLoggedIn(user) {
        $('#profileName').text(user.username);
        $('#profileUsername').text('ID: ' + user.id);
        $('#profileAddr').text(user.address || '尚未设置收货地址');

        $('#loginPrompt').hide();
        $('#profileMenu').show();
        $('#orderSection').show();
        $('#logoutRow').show();
    }

    // ========== 未登录状态 UI ==========
    function showLoggedOut() {
        $('#profileName').text('未登录');
        $('#profileUsername').text('');
        $('#profileAddr').text('');

        $('#loginPrompt').show();
        $('#profileMenu').hide();
        $('#orderSection').hide();
        $('#logoutRow').hide();
    }

    // ========== 加载我的订单 ==========
    function loadMyOrders() {
        $.ajax({
            url: '/api/orders/my',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.code === 200 && res.data && res.data.length > 0) {
                    renderOrders(res.data);
                } else {
                    $('#orderList').html(
                        '<div class="empty-state">' +
                        '<i class="fa fa-inbox"></i>' +
                        '<p>暂无订单，快去点一杯吧~</p>' +
                        '</div>'
                    );
                }
            },
            error: function () {
                $('#orderList').html(
                    '<div class="empty-state">' +
                    '<i class="fa fa-exclamation-triangle"></i>' +
                    '<p>加载订单失败</p>' +
                    '</div>'
                );
            }
        });
    }

    // ========== 渲染订单列表 ==========
    function renderOrders(orders) {
        var $container = $('#orderList');
        $container.empty();

        $.each(orders, function (i, order) {
            var statusText = order.status === 'pending' ? '待处理' :
                             order.status === 'done' ? '已完成' : order.status;
            var statusClass = order.status === 'pending' ? 'status-pending' :
                              order.status === 'done' ? 'status-done' : 'status-cancel';
            var createTime = order.createTime || '';

            var cardHtml = '<div class="order-card">';

            // 订单头部
            cardHtml +=
                '<div class="oc-header">' +
                    '<span><i class="fa fa-clock-o"></i> ' + escapeHtml(createTime) + '</span>' +
                    '<span class="oc-status ' + statusClass + '">' + escapeHtml(statusText) + '</span>' +
                '</div>';

            // 订单商品列表
            cardHtml += '<div class="oc-items">';
            if (order.items && order.items.length > 0) {
                $.each(order.items, function (j, item) {
                    var imgSrc = item.productImageUrl || '';
                    cardHtml +=
                        '<div class="oc-item">' +
                            '<img src="' + imgSrc + '" ' +
                                'onerror="this.style.background=\'#F5E6D8\';this.style.display=\'block\';" ' +
                                'alt="' + escapeHtml(item.productName || '') + '">' +
                            '<div class="oci-name">' +
                                escapeHtml(item.productName || '商品') +
                                '<div class="oci-spec">' +
                                    escapeHtml(item.sweetness || '') + ' / ' + escapeHtml(item.iceLevel || '') +
                                '</div>' +
                            '</div>' +
                            '<span class="oci-qty">×' + item.quantity + '</span>' +
                            '<span class="oci-subtotal">' + (item.productPrice * item.quantity).toFixed(2) + '</span>' +
                        '</div>';
                });
            }
            cardHtml += '</div>';

            // 订单底部合计
            cardHtml +=
                '<div class="oc-footer">' +
                    '<span class="oc-total-label">合计</span>' +
                    '<span class="oc-total-price">' + order.totalPrice.toFixed(2) + '</span>' +
                '</div>';

            cardHtml += '</div>';
            $container.append(cardHtml);
        });
    }

    // ========== 退出登录 ==========
    $('#btnLogout').on('click', function () {
        if (!confirm('确定要退出登录吗？')) return;

        $.ajax({
            url: '/api/user/logout',
            type: 'POST',
            dataType: 'json',
            success: function () {
                currentUser = null;
                showLoggedOut();
                $('#orderList').empty();
                // 跳转到首页
                location.href = 'index.html';
            },
            error: function () {
                alert('退出失败，请稍后再试');
            }
        });
    });

    // ========== 简单 XSS 防护 ==========
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ========== 启动 ==========
    init();
});
