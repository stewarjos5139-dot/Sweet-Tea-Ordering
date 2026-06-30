/**
 * 甜趣奶茶点单系统 - 分类页逻辑
 * 模块2：分类页与接口（成员2任务）
 */
$(function () {

    var currentCategoryId = 0;  // 当前选中的分类ID，0=全部
    var categoryIcons = ['fa-lemon-o', 'fa-coffee', 'fa-moon-o', 'fa-cutlery'];

    // ========== 步骤1：加载分类列表 ==========
    function loadCategories() {
        $.ajax({
            url: '/api/categories',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.code === 200 && res.data && res.data.length > 0) {
                    renderCategories(res.data);
                    // 分类加载完成后，自动加载对应商品
                    loadProducts(currentCategoryId);
                } else {
                    $('#categorySidebar').append(
                        '<div class="cat-item" style="color:#999;">无分类</div>'
                    );
                }
            },
            error: function () {
                $('#categorySidebar').append(
                    '<div class="cat-item" style="color:#999;">加载失败</div>'
                );
            }
        });
    }

    // ========== 渲染左侧分类列表 ==========
    function renderCategories(categories) {
        var $sidebar = $('#categorySidebar');
        // 保留"全部"选项，追加各分类
        $.each(categories, function (i, cat) {
            var iconClass = categoryIcons[i] || 'fa-tag';
            var catItem =
                '<div class="cat-item" data-id="' + cat.id + '">' +
                    '<span class="cat-icon"><i class="fa ' + iconClass + '"></i></span>' +
                    escapeHtml(cat.name) +
                '</div>';
            $sidebar.append(catItem);
        });

        // 检查 URL 参数，是否指定了初始分类
        var urlParams = new URLSearchParams(window.location.search);
        var cidParam = urlParams.get('cid');
        if (cidParam) {
            var targetId = parseInt(cidParam, 10);
            switchCategory(targetId);
        }
    }

    // ========== 步骤2：加载分类下的商品 ==========
    function loadProducts(categoryId) {
        var $content = $('#categoryContent');
        $content.html(
            '<div class="empty-state">' +
            '<i class="fa fa-spinner fa-spin"></i>' +
            '<p>正在加载商品…</p>' +
            '</div>'
        );

        $.ajax({
            url: '/api/categories/' + categoryId + '/products',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.code === 200 && res.data && res.data.length > 0) {
                    renderProducts(res.data, categoryId);
                } else {
                    $content.html(
                        '<div class="empty-state">' +
                        '<i class="fa fa-inbox"></i>' +
                        '<p>该分类暂无商品</p>' +
                        '</div>'
                    );
                }
            },
            error: function () {
                $content.html(
                    '<div class="empty-state">' +
                    '<i class="fa fa-exclamation-triangle"></i>' +
                    '<p>加载失败，请稍后再试</p>' +
                    '</div>'
                );
            }
        });
    }

    // ========== 渲染右侧商品列表 ==========
    function renderProducts(products, categoryId) {
        var $content = $('#categoryContent');
        // 分类标题
        var titleText = (categoryId === 0) ? '全部商品' : getCategoryName(categoryId);
        var html = '<div class="cat-title">' + titleText + '</div>';

        $.each(products, function (i, product) {
            var imgSrc = product.imageUrl || '';
            html +=
                '<div class="product-item" onclick="location.href=\'detail.html?id=' + product.id + '\'">' +
                    '<img src="' + imgSrc + '" ' +
                        'onerror="this.style.background=\'linear-gradient(135deg, #FFB563, #FF8C5A)\';' +
                        'this.style.display=\'block\';" ' +
                        'alt="' + escapeHtml(product.name) + '">' +
                    '<div class="pi-info">' +
                        '<h5>' + escapeHtml(product.name) + '</h5>' +
                        '<p class="pi-desc">' + escapeHtml(product.description || '') + '</p>' +
                        '<span class="pi-price">' + product.price.toFixed(2) + '</span>' +
                    '</div>' +
                    '<button class="pi-buy" onclick="event.stopPropagation();location.href=\'detail.html?id=' + product.id + '\'">' +
                        '<i class="fa fa-plus"></i>' +
                    '</button>' +
                '</div>';
        });

        $content.html(html);
    }

    // ========== 切换分类 ==========
    function switchCategory(categoryId) {
        currentCategoryId = categoryId;
        // 更新侧边栏高亮
        $('#categorySidebar .cat-item').each(function () {
            var id = parseInt($(this).data('id'), 10);
            $(this).toggleClass('active', id === categoryId);
        });
        // 加载商品
        loadProducts(categoryId);
    }

    // ========== 获取分类名称（从侧边栏读取） ==========
    function getCategoryName(categoryId) {
        var $item = $('#categorySidebar .cat-item[data-id="' + categoryId + '"]');
        if ($item.length > 0) {
            // 取文本内容（去掉图标后的文字）
            return $item.contents().filter(function () {
                return this.nodeType === 3 && $.trim(this.textContent) !== '';
            }).text().trim() || $item.text().trim();
        }
        return '商品列表';
    }

    // ========== 简单 XSS 防护 ==========
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ========== 事件绑定：侧边栏分类点击 ==========
    $('#categorySidebar').on('click', '.cat-item', function () {
        var categoryId = parseInt($(this).data('id'), 10);
        if (!isNaN(categoryId)) {
            switchCategory(categoryId);
        }
    });

    // ========== 启动：加载分类 ==========
    loadCategories();
});
