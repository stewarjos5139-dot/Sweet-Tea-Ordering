/**
 * 甜趣奶茶点单系统 - 全部商品瀑布流逻辑
 * 模块4：全部商品瀑布流（成员4任务）
 */
$(function () {

    var currentPage = 1;
    var pageSize = 10;
    var totalPages = 1;
    var isLoading = false;
    var currentKeyword = '';

    // ========== 加载商品列表 ==========
    function loadProducts(keyword, append) {
        if (isLoading) return;
        isLoading = true;

        var requestPage = append ? currentPage : 1;

        $.ajax({
            url: '/api/products/all',
            type: 'GET',
            data: {
                page: requestPage,
                size: pageSize,
                keyword: keyword || ''
            },
            dataType: 'json',
            success: function (res) {
                isLoading = false;

                if (res.code === 200 && res.data) {
                    var data = res.data;
                    totalPages = data.totalPages;
                    currentPage = data.page;

                    if (append) {
                        appendProducts(data.list);
                    } else {
                        renderProducts(data.list);
                    }

                    // 加载更多提示
                    if (data.hasMore) {
                        $('#loadMoreTip').text('上拉加载更多…').show();
                    } else if (data.list.length > 0) {
                        $('#loadMoreTip').text('—— 已经到底了 ——').show();
                    } else {
                        $('#loadMoreTip').hide();
                    }
                } else {
                    if (!append) {
                        showEmpty();
                    }
                    $('#loadMoreTip').hide();
                }
            },
            error: function () {
                isLoading = false;
                if (!append) {
                    showError();
                }
            }
        });
    }

    // ========== 渲染商品卡片（瀑布流） ==========
    function renderProducts(products) {
        var $container = $('#waterfallContainer');
        $container.empty();

        if (!products || products.length === 0) {
            showEmpty();
            return;
        }

        $.each(products, function (i, p) {
            $container.append(buildCard(p));
        });
    }

    function appendProducts(products) {
        var $container = $('#waterfallContainer');
        $.each(products, function (i, p) {
            $container.append(buildCard(p));
        });
    }

    function buildCard(product) {
        // 随机高度模拟瀑布流（120-200px）
        var imgHeight = 130 + (product.id % 5) * 16;
        var imgSrc = product.imageUrl || '';

        return (
            '<div class="wf-card" onclick="location.href=\'detail.html?id=' + product.id + '\'">' +
                '<img src="' + imgSrc + '" ' +
                    'style="height:' + imgHeight + 'px;object-fit:cover;" ' +
                    'onerror="this.style.background=\'linear-gradient(135deg, #FFB563, #FF8C5A)\';' +
                    'this.style.display=\'block\';this.style.height=\'' + imgHeight + 'px\';" ' +
                    'alt="' + escapeHtml(product.name) + '">' +
                '<div class="wf-info">' +
                    '<h5>' + escapeHtml(product.name) + '</h5>' +
                    '<p class="wf-desc">' + escapeHtml(product.description || '') + '</p>' +
                    '<div class="wf-bottom">' +
                        '<span class="wf-price">' + product.price.toFixed(2) + '</span>' +
                        '<button class="btn-add" onclick="event.stopPropagation();location.href=\'detail.html?id=' + product.id + '\'">' +
                            '<i class="fa fa-plus"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function showEmpty() {
        $('#waterfallContainer').html(
            '<div class="empty-state">' +
            '<i class="fa fa-inbox"></i>' +
            '<p>没有找到相关商品</p>' +
            '</div>'
        );
    }

    function showError() {
        $('#waterfallContainer').html(
            '<div class="empty-state">' +
            '<i class="fa fa-exclamation-triangle"></i>' +
            '<p>加载失败，请稍后再试</p>' +
            '</div>'
        );
    }

    // ========== 简单 XSS 防护 ==========
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ========== 搜索事件 ==========
    $('#btnSearch').on('click', function () {
        currentKeyword = $('#searchInput').val().trim();
        currentPage = 1;
        loadProducts(currentKeyword, false);
    });

    // 回车搜索
    $('#searchInput').on('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            currentKeyword = $(this).val().trim();
            currentPage = 1;
            loadProducts(currentKeyword, false);
        }
    });

    // ========== 滚动分页加载（触底加载更多） ==========
    var scrollTimer = null;
    $(window).on('scroll', function () {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
            if (isLoading || currentPage >= totalPages) return;

            var $lastCard = $('#waterfallContainer .wf-card').last();
            if ($lastCard.length === 0) return;

            var lastCardTop = $lastCard.offset().top;
            var windowBottom = $(window).scrollTop() + $(window).height();

            // 最后一张卡片进入可视区域时加载更多
            if (lastCardTop < windowBottom + 100) {
                currentPage++;
                loadProducts(currentKeyword, true);
            }
        }, 150);
    });

    // ========== 启动：加载首页数据 ==========
    loadProducts('', false);
});
