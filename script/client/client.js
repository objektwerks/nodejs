var query = null,
    madmax = function () {
        var socket = io.connect('http://' + location.hostname, { port: 8079 }),
            queryNames = [],
            htmlSelectorType = 'class',
            htmlTreeSelectorType = 'class',
            currentSelector = "",
            selectorIndex = {
                key: "",
                selector: -1,
                subselector: -1,
                isSelectorActive: function() {
                    return (this.selector > -1 && this.isActive())
                },
                isSubSelectorActive: function() {
                    return (this.subselector > -1 && this.isActive())
                },
                isActive: function() {
                    var node = $("#selector-tree").dynatree("getTree").getNodeByKey(this.key);
                    if (node && node.isActive()) {
                        return true;
                    } else {
                        return false;
                    }
                }
            };

// Connector Functions
        socket.on('connect', function() {
            $('#progress-image').show();
            $('#disconnect-connect-image').attr('src', 'image/connect.png');
            $('#disconnect-connect-image').attr('title', 'Connected');
            socket.emit('listQueryNames');
        });

        socket.on('disconnect', function() {
            $('#disconnect-connect-image').attr('src', 'image/disconnect.png');
            $('#disconnect-connect-image').attr('title', 'Disconnected');
        });

        socket.on('newQuery', function(message) {
            $('#progress-image').hide();
            if (message.query.code === 500) {
                log('New Query Error', message.query.code, message.query.error);
            } else {
                setQuery(message.query);
            }
        });

        socket.on('saveQuery', function(message) {
            $('#progress-image').hide();
            if (message.status.code === 500) {
                log('Save Query Error', message.status, message.status.error);
            }
        });

        socket.on('findQuery', function(message) {
            $('#progress-image').hide();
            if (message.query.code === 500) {
                log('Find Query Error', message.query.code, message.query.error);
            } else {
                setQuery(message.query);
            }
        });

        socket.on('listQueryNames', function(message) {
            $('#progress-image').hide();
            if (message.list.code === 500) {
                log('List Query Names Error', message.list.code, message.list.error);
            } else {
                queryNames = message.list.names;
                setQueryNames(queryNames);
            }
        });

        socket.on('readResource', function(message) {
            $('#progress-image').hide();
            if (message.resource.code === 500) {
                log('Read Resource Error', message.resource.code, message.resource.error);
            } else if (message.resource.type === 'html') {
                setQuerySource(message.resource);
            } else if (message.resource.type === 'css') {
                setCssSource(message.resource.content);
            } else if (message.resource.type === 'js') {
                setJsSource(message.resource.content);
            } else if (message.resource.type === 'template') {
                setTemplate(message.resource.content);
            }
        });

        socket.on('executeQuery', function(message) {
            $('#progress-image').hide();
            if (message.executor.code === 500) {
                log('Execute Query Error', message.executor.code, message.executor.error);
            } else {
                setExecutedQuery(message);
                buildView(message.executor.objects);
            }
        });

        socket.on('buildView', function(message) {
            $('#progress-image').hide();
            if (message.view.code === 500) {
                log('Build View Error', message.view.code, message.view.error);
            } else {
                setView(message.view);
                setViewSource(message.view);
            }
        });
// Public Functions
        return {
            init: function() {
                $(document).ready(function() {
                    $(window).resize(onWindowResize);
                    $('#progress-image').hide();
                    $('#query-search-autocomplete').keypress(onSearchKeyPress);
                    $('#query-search').button({ icons: { primary: "ui-icon-search" }, text: false }).click(onSearchQueryNames);
                    $('#query-url').keypress(onQueryUrlKeyPress);
                    $('#query-new').button({ icons: { primary: "ui-icon-plusthick" }, text: false }).click(onNewQuery);
                    $('#query-save').button({ icons: { primary: "ui-icon-disk" }, text: false, disabled: true }).click(onSaveQuery);
                    $('#query-refresh').button({ icons: { primary: "ui-icon-refresh" }, text: false, disabled: true }).click(onRefreshQuery);
                    $('#html-selector-types').click(onHtmlSelectorTypeChecked);
                    $('#html').load(onQueryUrlLoad);
                    $('#html-tree-selector-types').click(onHtmlTreeSelectorTypeChecked);
                    $('#html-tree').dynatree({ selectMode: 1, onClick: onHtmlTreeClick, onDblClick: onHtmlTreeDoubleClick });
                    $('#query-tabs').tabs({ select: onQueryTabsSelect });
                    $('#query-tabs').tabs({ "selected": 0 });
                    $('#html-source-accordion').accordion();
                    $('#css-list').click(onCssListClick);
                    $('#js-list').click(onJsListClick);
                    $('#template-url').keypress(onTemplateUrlKeyPress);
                    $('#template-render').button({ icons: { primary: "ui-icon-newwin" }, text: false, disabled: false }).click(onRenderTemplate);
                    $('#query-tab-expand-contract').button({ icons: { primary: 'ui-icon-circle-arrow-e'}, text: false, disabled: false }).click(onExpandCollapseQueryTabs);
                    $('#selector-tabs').tabs({ select: onSelectorTabsSelect });
                    $('#executor-accordion').accordion();
                    $('#selector-name').keypress(onSelectorNameKeyPress);
                    $('#selector').keypress(onSelectorKeyPress);
                    $('#head').keypress(onHeadKeyPress);
                    $('#head-copy').button({ icons: { primary: "ui-icon-copy" }, text: false, disabled: true }).click(onSourceHeadCopy);
                    $('#selector-remove').button({ icons: { primary: "ui-icon-minusthick" }, text: false, disabled: true }).click(onRemoveSelector);
                    $('#selector-execute').button({ icons: { primary: "ui-icon-notice" }, text: false, disabled: true }).click(onExecuteSelector);
                    $('#selector-tree').dynatree({ selectMode: 1, onClick: onSelectorTreeClick, onDblClick: onSelectorTreeDblClick });
                    $('#query-execute').button({ icons: { primary: "ui-icon-notice" }, text: false, disabled: true }).click(onExecuteQuery);
                    $('#selector-expand-contract').button({ icons: { primary: "ui-icon-circle-arrow-w" }, text: false, disabled: false }).click(onExpandCollapseSelectorTabs);
                    resetQuery();
                    resetSelector();
                    resetTemplate();
                    $('input:text:visible:first').focus();
                    onWindowResize();
                });
            }
        };
// Event Handlers
        function onWindowResize(event) {
            $('.accordion').css('height', (.73 * window.innerHeight));
            $('.tab').css('height', (.80 * window.innerHeight));
        }
        
        function onSearchKeyPress(event) {
            if (event.ctrlKey && (event.which == 114 || event.which == 18) /*114=Firefox, 18=Chrome, ctrl-r */) {
                onRefreshQueryNames(event);
            }
        }

        function onQueryUrlKeyPress(event) {
            if (event.which == 13 /* return */) {
                $('#html-source').val("");
                $('#progress-image').show();
                var url = $("#query-url").val();
                socket.emit('readResource', messageFactory.createResource(url, 'html'));
                listenForQueryHtmlSourceChange(url);
                $('#query-save').button('option', 'disabled', false);
            }
        }

        function onQueryUrlLoad() {
            var body = $('#html').contents().find('body *');
            body.mouseenter(onQueryHtmlMouseEnter);
            body.click(onHtmlSelectorClick);
            loadHtmlTree();
            loadCssList();
            loadJsList();
        }

        function onQueryHtmlMouseEnter(event) {
            event.preventDefault();
            event.stopPropagation();
            $('#html').contents().find(currentSelector).each(function () {
                $(this).removeAttr('style');
            });
            switch (htmlSelectorType) {
                case 'class':
                    currentSelector = $(event.currentTarget).selectByClass();
                    break;
                case 'id':
                    currentSelector = $(event.currentTarget).selectById();
                    break;
                case 'id-class':
                    currentSelector = $(event.currentTarget).selectByIdAndClass();
                    break;
                case 'element':
                    currentSelector = $(event.currentTarget).selectByElement();
                    break;
                default:
                    currentSelector = $(event.currentTarget).selectByClass();
            }
            $('#html').contents().find(currentSelector).each(function (index, element) {
                $(this).attr('style', 'border: 3px solid orange');
            });
            $('#html-selector').val(currentSelector);
            $('#current-selector').val(currentSelector);
        }

        function onHtmlSelectorClick(event) {
            event.preventDefault();
            event.stopPropagation();
            $('#selector-add-replace-dialog').dialog({ autoOpen: false, resizable: false, height:400, width: 600, modal: true,
                buttons: {
                    'Add': function() {
                        addSelector($('#current-selector-name').val(), $('#current-selector').val());
                        $(this).dialog('destroy');
                    },
                    'Replace': function() {
                        if (selectorIndex.isSelectorActive()) {
                            query.selectors[selectorIndex.selector].selector = $('#current-selector').val();
                            setSelector(query.selectors[selectorIndex.selector]);
                            bindAndSaveQuery();
                        } else if (selectorIndex.isSubSelectorActive()) {
                            query.selectors[selectorIndex.selector].subselectors[selectorIndex.subselector].selector = $('#current-selector').val();
                            setSubSelector(query.selectors[selectorIndex.selector], query.selectors[selectorIndex.selector].subselectors[selectorIndex.subselector]);
                            bindAndSaveQuery();
                        }
                        $(this).dialog('destroy');
                    },
                    'Cancel': function() {
                        $(this).dialog('destroy');
                    }
                }
            });
            $('#current-selector-name').val("");
            var activeNode = $("#selector-tree").dynatree("getTree").getActiveNode();
            var nodeTitle = "root";
            if (activeNode) {
                nodeTitle = activeNode.data.title;
            }
            $('#current-selector-node').val(nodeTitle);
            $('#selector-add-replace-dialog').dialog('open');
        }

        function onQueryTabsSelect(event, ui) {
            if (query) {
                if (ui.index == 3) {
                    onExecuteQuery(event);
                }
            }
        }

        function onSelectorTabsSelect(event, ui) {
            if (query) {
                if (ui.index == 2) {
                    onExecuteQuery(event);
                }
            }
        }

        function onExecuteQuery(event) {
            if (query) {
                $('#executor-response').val("");
                $('#view').attr('src', "");
                $('#view-source').val("");
                $('#progress-image').show();
                socket.emit('executeQuery', messageFactory.createExecutor(query.name));
            }
        }

        function onCssListClick(event) {
            $('#progress-image').show();
            var url = common.getProtocolHostPath(query.url) + $('#css-list').find('option:selected').text();
            socket.emit('readResource', messageFactory.createResource(url, 'css'));
        }

        function onJsListClick(event) {
            $('#progress-image').show();
            var url = common.getProtocolHostPath(query.url) + $('#js-list').find('option:selected').text();
            socket.emit('readResource', messageFactory.createResource(url, 'js'));
        }

        function onExpandCollapseQueryTabs(event) {
            $('#selector-tabs').toggle();
            if ($('#selector-tabs').is(':hidden') === true) {
                $('#query-tabs').width('99.7%');
                $('#query-tab-expand-contract').button({ icons : { primary : 'ui-icon-circle-arrow-w' } });
                $('#query-tab-expand-contract').attr('title', 'Contract Tab');
            } else {
                $('#query-tabs').width('69%');
                $('#query-tab-expand-contract').button({ icons : { primary : 'ui-icon-circle-arrow-e' } });
                $('#query-tab-expand-contract').attr('title', 'Expand Tab');
            }
        }

        function onExpandCollapseSelectorTabs(event) {
            $('#query-tabs').toggle();
            if ($('#query-tabs').is(':hidden') === true) {
                $('#selector-tabs').width('99.7%');
                $('#selector-expand-contract').button({ icons : { primary : 'ui-icon-circle-arrow-e' } });
                $('#selector-expand-contract').attr('title', 'Hide SubSelectors');
            } else {
                $('#selector-tabs').width('30%');
                $('#selector-expand-contract').button({ icons : { primary : 'ui-icon-circle-arrow-w' } });
                $('#selector-expand-contract').attr('title', 'Show SubSelectors');
            }
        }

        function onHtmlSelectorTypeChecked(event) {
            htmlSelectorType = $('input[name=html-selector-type]:checked').val();
        }

        function onHtmlTreeSelectorTypeChecked(event) {
            htmlTreeSelectorType = $('input[name=html-tree-selector-type]:checked').val();
        }

        function onHtmlTreeClick(node, event) {
            $('#html-tree-selector').val(toSelector(node, toParentPath(node)));
        }

        function onHtmlTreeDoubleClick(node, event) {
            var selector = toSelector(node, toParentPath(node));
            $('#html-tree-selector').val(selector);
            $('#current-selector').val(selector);
            onHtmlSelectorClick(event);
        }

        function onRefreshQueryNames(event) {
            $('#progress-image').show();
            socket.emit('listQueryNames');
        }

        function onSearchQueryNames(event) {
            $('#query-search-dialog').dialog({ autoOpen: false, resizable: true, height:500, width: 500, modal: true,
                open: function(event, ui) {
                    $('#query-name-list').empty();
                    for (var i = 0, l = queryNames.length; i < l; i += 1) {
                        $('#query-name-list').prepend('<option>' + queryNames[i] + '</option>');
                    }
                    if (queryNames.length > 0) {
                        $('#query-name-list :first-child').attr('selected', true);
                    }
                },
                buttons: {
                    'Select': function() {
                        var name = $('#query-name-list :selected').text();
                        if (name) {
                            $('#progress-image').show();
                            socket.emit('findQuery', messageFactory.createFinder(name));
                        }
                        $(this).dialog('destroy');
                    },
                    'Cancel': function() {
                        $(this).dialog('destroy');
                    }
                }
            });
            onRefreshQueryNames(event);
            setTimeout(function() {
                $('#query-search-dialog').dialog('open');
            }, 500);
        }

        function onNewQuery(event) {
            $('#query-new-dialog').dialog({ autoOpen: false, resizable: false, height:160, width: 500, modal: true,
                buttons: {
                    'Yes': function() {
                        $('#progress-image').show();
                        var name = $('#query-new-name').val();
                        if (!name || name.length < 0) {
                            name = new Date().toLocaleTimeString();
                        }
                        var url = $('#query-new-url').val();
                        if (!url || url.length < 12) {
                            url = "http://google.com";
                        }
                        socket.emit('newQuery', messageFactory.createQuery('', name, url));
                        $(this).dialog('destroy');
                    },
                    'No': function() {
                        $(this).dialog('destroy');
                    }
                }
            });
            $('#query-new-name').val("");
            $('#query-new-url').val("");
            $('#query-new-dialog').dialog('open');
        }

        function onSaveQuery(event) {
            if (query) {
                bindAndSaveQuery()
            }
        }

        function onRefreshQuery(event) {
            if (query) {
                $('#query-save').button('option', 'disabled', true);
                $('#progress-image').show();
                socket.emit('findQuery', messageFactory.createFinder(query.name));
            }
        }

        function onSelectorNameKeyPress(event) {
            if (event.ctrlKey && (event.which == 115 || event.which == 19) /* 115=Firefox, 19=Chrome, ctrl-s */) {
                bindAndSaveQuery();
                loadSelectorTree();
            } else {
                $('#query-save').button('option', 'disabled', false);
            }
        }

        function onHeadKeyPress(event) {
            if (event.ctrlKey && (event.which == 115 || event.which == 19) /* 115=Firefox, 19=Chrome, ctrl-s */) {
                bindAndSaveQuery();
            } else {
                $('#query-save').button('option', 'disabled', false);
            }
        }

        function onSelectorKeyPress(event) {
            if (event.ctrlKey && (event.which == 115 || event.which == 19) /* 115=Firefox, 19=Chrome, ctrl-s */) {
                onExecuteSelector(event);
            } else {
                $('#query-save').button('option', 'disabled', false);
            }
        }

        function onRemoveSelector(event) {
            $('#selector-remove-dialog').dialog({ autoOpen: false, resizable: false, height:140, modal: true,
                buttons: {
                    'Yes': function() {
                        removeSelector();
                        $(this).dialog('destroy');
                    },
                    'No': function() {
                        $(this).dialog('destroy');
                    }
                }
            });
            $('#selector-remove-dialog').dialog('open');
        }

        function onExecuteSelector(event) {
            bindAndSaveQuery();
            if (selectorIndex.isSubSelectorActive()) {
                setSelectorSource(query.selectors[selectorIndex.selector].selector, query.selectors[selectorIndex.selector].subselectors[selectorIndex.subselector].selector);
                bindAndSaveQuery();
            } else if (selectorIndex.isSelectorActive()) {
                setSelectorSource(query.selectors[selectorIndex.selector].selector);
                bindAndSaveQuery();
            }
        }

        function onSelectorTreeClick(node, event) {
            $('.selector-icon-button').button('option', 'disabled', false);
            setSelectorIndex(node);
        }

        function onSelectorTreeDblClick(node, event) {
            loadSelectorTree();
        }

        function onSourceHeadCopy(event) {
            var head = $('#html').contents().find('head').html();
            $('#head').val('<head>' + head + '</head>');
            bindAndSaveQuery();
        }

        function onTemplateUrlKeyPress(event) {
            if (event.which == 13 /* return */) {
                onRenderTemplate(event);
            }
        }

        function onRenderTemplate(event) {
            $('#progress-image').show();
            var url = $("#template-url").val();
            socket.emit('readResource', messageFactory.createResource(url, 'template'));
        }
// Query Model Functions
        function setQueryNames(names) {
            $('#query-search-autocomplete').autocomplete({ autoFocus: true, source: names,
                select: function(event, ui) {
                    $('#progress-image').show();
                    socket.emit('findQuery', messageFactory.createFinder(ui.item.value));
                }
            });
        }

        function setQuery(query) {
            resetQuery();
            resetSelector();
            resetTemplate();
            this.query = query;
            $('#query-refresh').button('option', 'disabled', false);
            $('#head-copy').button('option', 'disabled', false);
            $('#query-execute').button('option', 'disabled', false);
            $('#query-name').val(query.name);
            $('#query-url').val(query.url);
            if (!query.template) {
                $('#template-url').val('http://' + location.hostname + ':8079/template/list.tmpl');
            } else {
                $('#template-url').val(query.template);
            }
            loadSelectorTree();
            $('#head').val(query.head);
            $('#query-url').attr('readonly', false);
            $('#query-url').css({ 'background': 'white' });
            $('#html-source').val("");
            $('#query-tabs').tabs({ "selected": 0 });
            $('#progress-image').show();
            socket.emit('readResource', messageFactory.createResource(query.url, 'html'));
            listenForQueryHtmlSourceChange(query.url);
        }

        function bindAndSaveQuery(skipBinding) {
            $('#progress-image').show();
            $('#query-save').button('option', 'disabled', true);
            query.url = $('#query-url').val();
            query.head = $('#head').val();
            query.template = $('#template-url').val();
            if (!skipBinding) {
                if (selectorIndex.isSubSelectorActive()) {
                    query.selectors[selectorIndex.selector].subselectors[selectorIndex.subselector].name = $('#selector-name').val();
                    query.selectors[selectorIndex.selector].subselectors[selectorIndex.subselector].selector = $('#selector').val();
                } else if (selectorIndex.isSelectorActive()) {
                    query.selectors[selectorIndex.selector].name = $('#selector-name').val();
                    query.selectors[selectorIndex.selector].selector = $('#selector').val();
                }
            }
            socket.emit('saveQuery', messageFactory.createQuery(query.id, query.name, query.url, query.selectors, query.head, query.template));
        }

        function setQuerySource(resource) {
            $("#html").attr('src', resource.url);
            $('#html-source').val(resource.content);
        }

        function setExecutedQuery(message) {
            $('#executor-response').val(JSON.stringify(message, null, 4));
        }
// Selector Model Functions
        function loadSelectorTree() {
            resetSelector();
            if (query && query.selectors.length > 0) {
                var root = $("#selector-tree").dynatree('getRoot');
                var selectors = query.selectors;
                var subselectors;
                var selectorNode;
                var subselectorNode;
                for (var i = 0, l = selectors.length; i < l; i += 1) {
                    selectorNode = root.addChild({ key: i + '', title: selectors[i].name });
                    subselectors = selectors[i].subselectors;
                    for (var j = 0, ll = subselectors.length; j < ll; j += 1) {
                        subselectorNode = selectorNode.addChild({ key: i + '.' + j, title: subselectors[j].name });
                        subselectorNode.deactivate();
                    }
                    selectorNode.deactivate();
                    selectorNode.expand(true);
                }
            }
        }

        function setSelectorIndex(node) {
            node.activateSilently(true);
            var key = node.data.key;
            selectorIndex.key = key;
            if (key.indexOf('.') == -1) {
                selectorIndex.selector = parseInt(key);
                selectorIndex.subselector = -1;
                setSelector(query.selectors[selectorIndex.selector]);
            } else {
                selectorIndex.selector = parseInt(node.parent.data.key);
                selectorIndex.subselector = parseInt(key.split('.')[1]);
                setSubSelector(query.selectors[selectorIndex.selector], query.selectors[selectorIndex.selector].subselectors[selectorIndex.subselector]);
            }
        }

        function setSelector(selector) {
            $('#selector-name').val(selector.name);
            $('#selector').val(selector.selector);
            setSelectorSource(selector.selector);
            setSelectorButtonState();
        }

        function setSubSelector(selector, subselector) {
            $('#selector-name').val(subselector.name);
            $('#selector').val(subselector.selector);
            setSelectorSource(selector.selector, subselector.selector);
            setSelectorButtonState();
        }

        function setSelectorSource(selector, subselector) {
            $('#selector-result').val("");
            try {
                var containsImgTagInSelector;
                var containsATagInSelector;
                var results;
                var values = [];
                var value = "";
                if (subselector) {
                    containsImgTagInSelector = common.containsTagInSelector(subselector, 'img');
                    containsATagInSelector = common.containsTagInSelector(subselector, 'a')
                    results = $('#html').contents().find(selector).find(subselector);
                } else {
                    containsImgTagInSelector = common.containsTagInSelector(selector, 'img');
                    containsATagInSelector = common.containsTagInSelector(selector, 'a')
                    results = $('#html').contents().find(selector);
                }
                if (results && results.length > 0) {
                    results.each(function() {
                        if (containsImgTagInSelector && $(this).attr('src')) {
                            if ($(this).attr('src').indexOf('http') === -1) {
                                values.push(common.getProtocolHostPath(query.url) + $(this).attr('src'));
                            } else {
                                values.push($(this).attr('src'));
                            }
                        } else if (containsATagInSelector && $(this).attr('href')) {
                            if ($(this).attr('href').indexOf('http') === -1) {
                                values.push(common.getProtocolHostPath(query.url) + $(this).attr('href'));
                            } else {
                                values.push($(this).attr('href'));
                            }
                        } else {
                            values.push($(this).html());
                        }
                    });
                    for (var i = 0, l = values.length; i < l; i += 1) {
                        value += i + '. ' + values[i] + '\n';
                    }
                    $('#selector-result').val(value);
                } else {
                    $('#selector-result').val("Empty selection @ " + new Date().toLocaleTimeString());
                }
            } catch(exception) {
                $('#selector-result').val("Syntax error: " + JSON.stringify(exception, null, 4));
            }
        }

        function addSelector(name, selector) {
            var newSelector;
            if (selectorIndex.isSelectorActive()) {
                newSelector = messageFactory.createSubSelector(name, selector);
                query.selectors[selectorIndex.selector].subselectors.push(newSelector);
                selectorIndex.subselector = query.selectors[selectorIndex.selector].subselectors.length - 1;
                selectorIndex.key = selectorIndex.selector + '.' + selectorIndex.subselector;
                loadSelectorTree();
                setSubSelector(query.selectors[selectorIndex.selector], query.selectors[selectorIndex.selector].subselectors[selectorIndex.subselector]);
            } else {
                newSelector = messageFactory.createSelector(name, selector);
                query.selectors.push(newSelector);
                selectorIndex.selector = query.selectors.length - 1;
                selectorIndex.key = selectorIndex.selector + '';
                loadSelectorTree();
                setSelector(query.selectors[selectorIndex.selector]);
            }
            bindAndSaveQuery(true);
        }

        function removeSelector() {
            if (selectorIndex.isSubSelectorActive()) {
                query.selectors[selectorIndex.selector].subselectors.splice(selectorIndex.subselector, 1);
                selectorIndex.subselector = query.selectors[selectorIndex.selector].subselectors.length - 1;
                selectorIndex.key = selectorIndex.selector + '.' + selectorIndex.subselector;
            } else {
                query.selectors.splice(selectorIndex.selector, 1);
                selectorIndex.selector = query.selectors.length - 1;
                selectorIndex.key = selectorIndex.selector + '';
            }
            bindAndSaveQuery(true);
            loadSelectorTree();
        }
// Template Model Functions
        function setTemplate(template) {
            bindAndSaveQuery();
            var message = JSON.parse($('#executor-response').val());
            var objects = { objects : message.executor.objects };
            $('#template-view').html('');
            $(template).tmpl(objects).appendTo('#template-view');
        }
// View Model Functions
        function setView(view) {
            $("#view").attr('src', view.url);
        }

        function setViewSource(view) {
            $('#view-source').val(view.content);
        }

        function buildView(objects) {
            socket.emit('buildView', messageFactory.createView(objects, query.head));
        }
// View Functions
        function resetQuery() {
            $('#query-search-autocomplete').val("");
            $('#query-name').val("");
            $('#query-url').val("");
            $('#html').attr('src', "");
            $('#html-selector').val("");
            $('#html-source').val("");
            $('#css-source').val("");
            $('#js-source').val("");
            $('#head').val("");
            $('#browser').attr('src', "");
            $('#html-tree-selector').val("");
            var root = $("#html-tree").dynatree('getRoot');
            try {
                root.removeChildren();
            } catch(ignore) {}
            $('#query-tabs').tabs({ "selected": 0 });
        }

        function resetSelector() {
            $('#selector-result').val("");
            $('#selector-name').val("");
            $('#selector').val("");
            var root = $("#selector-tree").dynatree('getRoot');
            try {
                root.removeChildren();
            } catch(ignore) {}
            $('.selector-icon-button').button('option', 'disabled', true);
            $('#executor-response').val("");
            $('#view').attr('src', "");
            $('#view-source').val("");
            $('#selector-tabs').tabs({ "selected": 0 });
        }

        function resetTemplate() {
            $('#template-url').val("");
            $('#template-view').html('');
        }

        function setSelectorButtonState() {
            if (query.selectors.length > 0) {
                $('#selector-remove').button('option', 'disabled', false);
                $('#selector-execute').button('option', 'disabled', false);
            } else {
                $('#selector-remove').button('option', 'disabled', true);
                $('#selector-execute').button('option', 'disabled', true);
            }
        }

        function setCssSource(content) {
            $('#css-source').val(content);
        }

        function setJsSource(content) {
            $('#js-source').val(content);
        }

        function listenForQueryHtmlSourceChange(url) {
            setTimeout(function() {
                if ($('#html-source').val().length == 0) {
                    log('Http Get Error', 500, 'Failed to get: ' + url);
                }
            }, 30000);
        }
// Tree Functions
        function loadHtmlTree() {
            $('#html-tree-selector').val("");
            var root = $("#html-tree").dynatree('getRoot');
            try {
                root.removeChildren();
            } catch(ignore) {
            }
            var elements = $('#html').contents().find('body');
            traverseHtmlTree(root, elements);
        }

        function traverseHtmlTree(node, elements) {
            elements.each(function(index, element) {
                var title = element.nodeName.toLowerCase();
                if (element.id) {
                    title += '#';
                    title += element.id;
                }
                if (element.className) {
                    title += '.';
                    title += element.className;
                }
                if (element.src) {
                    title += ', src=';
                    title += element.src;
                }
                if (element.firstChild && element.firstChild.nodeValue !== null && element.firstChild.nodeValue.trim().length > 0) {
                    title += ' - ';
                    title += element.firstChild.nodeValue;
                }
                var child = node.addChild({ title: title });
                traverseHtmlTree(child, $(this).children());
            });
        }

        function toParentPath(node) {
            var path = [];
            var reachedParent = -1; /* 0 = self, 1 = parent */
            node.visitParents(function(node) {
                if (node.data.title !== null) {
                    path.push(node.data.title);
                }
                reachedParent += 1;
                if (reachedParent == 1) {
                    return false;
                }
            }, true);
            path.reverse();
            return path;
        }

        function toSelector(node, path) {
            var data;
            var length;
            var selector = "";
            for (var i = 0, l = path.length; i < l; i += 1) {
                data = path[i].split(',');
                if (data[0] === 'html' || data[0] === 'body' || data[0] === 'thead' || data[0] === 'tbody') {
                    continue;
                }
                length = data.length;
                if (selector.length > 0) {
                    selector += ' > ';
                }
                selector += data[0];
                for (var j = 1, ll = data.length; j < ll; j += 1) {
                    if (htmlTreeSelectorType === 'class') {
                        selector = toClass(data[j], selector);
                    } else if (htmlTreeSelectorType === 'id') {
                        selector = toId(data[j], selector);
                    }  else if (htmlTreeSelectorType === 'id-class') {
                        selector = toClass(data[j], selector);
                        selector = toId(data[j], selector);
                    }
                }
            }
            return selector;
        }

        function toClass(data, selector) {
            if (data.indexOf('class=') > -1) {
                selector += '.' + data.slice(data.indexOf('class=') + 6, data.length);
            }
            return selector;
        }

        function toId(data, selector) {
            if (data.indexOf('id=') > -1) {
                selector += '#' + data.slice(data.indexOf('id=') + 3, data.length);
            }
            return selector;
        }
// List Functions
        function loadCssList() {
            $('#css-list').empty();
            $('#html').contents().find('head > link').each(function() {
                if ($(this).attr('href')) {
                    $('#css-list').prepend('<option>' + $(this).attr('href') + '</option>');
                }
            })
        }

        function loadJsList() {
            $('#js-list').empty();
            $('#html').contents().find('head > script').each(function() {
                if ($(this).attr('src')) {
                    $('#js-list').prepend('<option>' + $(this).attr('src') + '</option>');
                }
            })
        }
// Common Functions
        function log(message, code, error) {
            socket.emit('log', messageFactory.createLog(message, code, error));
            $('#log-dialog').dialog({ autoOpen: false, resizable: true, height:600, width: 700, modal: true,
                buttons: {
                    'Close': function() {
                        $(this).dialog('destroy');
                    }
                }
            });
            $('#log-message').text('Event: ' + message);
            $('#log-code').text('Code: ' + code);
            $('#log-error').text(error);
            $('#log-dialog').dialog('open');
        }
    }()

madmax.init();