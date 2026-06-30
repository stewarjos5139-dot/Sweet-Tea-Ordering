/**
 * 甜趣奶茶点单系统 - 首页逻辑
 * 模块1：首页统筹（组长任务）
 */
$(function () {

    // ========== 加载推荐商品 ==========
    function loadRecommend() {
        $.ajax({
            url: '/api/index/recommend',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.code === 200 && res.data && res.data.length > 0) {
                    renderRecommend(res.data);
                } else {
                    $('#recommendList').html(
                        '<div class="empty-state">' +
                        '<i class="fa fa-inbox"></i>' +
                        '<p>暂无推荐商品</p>' +
                        '</div>'
                    );
                }
            },
            error: function () {
                $('#recommendList').html(
                    '<div class="empty-state">' +
                    '<i class="fa fa-exclamation-triangle"></i>' +
                    '<p>加载失败，请检查网络</p>' +
                    '</div>'
                );
            }
        });
    }

    // ========== 渲染推荐商品列表 ==========
    function renderRecommend(products) {
        var $container = $('#recommendList');
        $container.empty();

        $.each(products, function (i, product) {
            // 如果没有真实图片，使用带背景色的占位图
            var imgSrc = product.imageUrl || '';
            var cardHtml =
                '<div class="recommend-card" onclick="location.href=\'detail.html?id=' + product.id + '\'">' +
                    '<img class="card-img" src="' + imgSrc + '" ' +
                        'onerror="this.style.background=\'linear-gradient(135deg, #FFB563, #FF8C5A)\';' +
                        'this.style.display=\'block\';" ' +
                        'alt="' + product.name + '">' +
                    '<div class="card-info">' +
                        '<h4>' + escapeHtml(product.name) + '</h4>' +
                        '<p class="desc">' + escapeHtml(product.description || '') + '</p>' +
                        '<span class="price">' + product.price.toFixed(2) + '</span>' +
                    '</div>' +
                    '<i class="fa fa-chevron-right" style="color:#ccc;font-size:14px;"></i>' +
                '</div>';
            $container.append(cardHtml);
        });
    }

    // ========== 简单 XSS 防护 ==========
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ========== 页面加载时执行 ==========
    loadRecommend();
});
