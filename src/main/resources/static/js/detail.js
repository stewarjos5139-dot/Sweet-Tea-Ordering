/**
 * 甜趣奶茶点单系统 - 商品详情与下单逻辑
 * 模块3：商品详情与下单（成员3任务）
 */
$(function () {

    // ---- 状态 ----
    var productId = null;
    var productPrice = 0;
    var productStock = 0;
    var quantity = 1;
    var sweetness = '全糖';
    var iceLevel = '正常';

    // ---- 初始化：从 URL 获取商品 ID ----
    var urlParams = new URLSearchParams(window.location.search);
    var idParam = urlParams.get('id');
    if (!idParam) {
        showToast('商品不存在');
        return;
    }
    productId = parseInt(idParam, 10);

    // ---- 加载商品详情 ----
    function loadDetail() {
        $.ajax({
            url: '/api/products/' + productId,
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.code === 200 && res.data) {
                    renderDetail(res.data);
                } else {
                    showToast('商品不存在或已下架');
                }
            },
            error: function () {
                showToast('加载失败，请稍后再试');
            }
        });
    }

    function renderDetail(product) {
        productPrice = product.price;
        productStock = product.stock;

        $('#detailName').text(product.name);
        $('#detailDesc').text(product.description || '暂无描述');
        $('#detailPrice').text(product.price.toFixed(2));
        $('#detailStock').text('库存：' + product.stock);

        var imgSrc = product.imageUrl || '';
        $('#detailImg').attr('src', imgSrc);
        $('#detailImg').on('error', function () {
            $(this).attr('src', '');
            $(this).css('background', 'linear-gradient(135deg, #FFB563, #FF8C5A)');
        });

        updateTotal();
    }

    // ---- 规格切换 ----
    $('#sweetnessOptions').on('click', '.spec-option', function () {
        $('#sweetnessOptions .spec-option').removeClass('active');
        $(this).addClass('active');
        sweetness = $(this).data('val');
    });

    $('#iceOptions').on('click', '.spec-option', function () {
        $('#iceOptions .spec-option').removeClass('active');
        $(this).addClass('active');
        iceLevel = $(this).data('val');
    });

    // ---- 数量加减 ----
    $('#btnMinus').on('click', function () {
        if (quantity > 1) {
            quantity--;
            $('#qtyNum').text(quantity);
            updateTotal();
            $('#btnMinus').prop('disabled', quantity <= 1);
        }
    });

    $('#btnPlus').on('click', function () {
        if (quantity < productStock) {
            quantity++;
            $('#qtyNum').text(quantity);
            updateTotal();
            $('#btnMinus').prop('disabled', false);
        } else {
            showToast('库存不足，当前库存：' + productStock);
        }
    });

    // ---- 更新合计价格 ----
    function updateTotal() {
        var total = (productPrice * quantity).toFixed(2);
        $('#totalPrice').text(total);
    }

    // ---- 提交订单 ----
    window.submitOrder = function () {
        // 先检查登录
        $.ajax({
            url: '/api/user/current',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.code !== 200) {
                    showToast('请先登录后再下单');
                    setTimeout(function () {
                        location.href = 'login.html?redirect=detail.html?id=' + productId;
                    }, 1200);
                    return;
                }
                // 已登录，发起下单
                doCreateOrder();
            },
            error: function () {
                showToast('网络错误，请稍后再试');
            }
        });
    };

    function doCreateOrder() {
        $('#btnSubmit').prop('disabled', true).text('提交中…');

        var orderData = {
            items: [{
                productId: productId,
                quantity: quantity,
                sweetness: sweetness,
                iceLevel: iceLevel
            }]
        };

        $.ajax({
            url: '/api/orders/create',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(orderData),
            dataType: 'json',
            success: function (res) {
                $('#btnSubmit').prop('disabled', false).text('立即下单');

                if (res.code === 200) {
                    showToast('下单成功！订单号：' + res.data.orderId);
                    // 刷新库存
                    setTimeout(function () {
                        location.reload();
                    }, 1500);
                } else if (res.code === 401) {
                    showToast('请先登录后再下单');
                    setTimeout(function () {
                        location.href = 'login.html?redirect=detail.html?id=' + productId;
                    }, 1200);
                } else {
                    showToast(res.message || '下单失败');
                }
            },
            error: function () {
                $('#btnSubmit').prop('disabled', false).text('立即下单');
                showToast('网络错误，请稍后再试');
            }
        });
    }

    // ---- Toast 提示 ----
    function showToast(msg) {
        var $toast = $('#toast');
        $toast.text(msg).fadeIn(200);
        clearTimeout($toast.data('timer'));
        $toast.data('timer', setTimeout(function () {
            $toast.fadeOut(300);
        }, 1800));
    }

    // ---- 启动 ----
    loadDetail();
});
