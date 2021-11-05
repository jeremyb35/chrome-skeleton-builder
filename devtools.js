var panels = chrome.devtools.panels;

panels.elements.createSidebarPane("Skeletons",

    function(sidebar) {
        function updateContent() {
            function createSkeleton() {

                function formatStart(node, isReact, styles) {
                    let nodeClass = node.getAttribute("class");
                    if (isReact && nodeClass === 'card')
                        return '<Card>';

                    return `<div ${isReact ? 'className' : 'class'}='${node.getAttribute("class")}' ${styles}>`
                }

                function formatEnd(node, isReact) {
                    let nodeClass = node.getAttribute("class");
                    if (isReact && nodeClass === 'card')
                        return '</Card>';

                    return `</div>\n`
                }

                function convertNodeToSkeleton(node, isReact) {
                    let skClassName = 'skeleton css-k31kfd-skeletonStyles-Skeleton';

                    if (node !== undefined) {
                        let nodes = node.childNodes;
                        let displayMode = window.getComputedStyle(node).getPropertyValue("display").replace('inline', 'inline-block');

                        //detect if the node has Element children
                        let hasChildren = Array.from(nodes).some(n => n.nodeType !== 3);

                        let styles = isReact ? `style={{ display: '${displayMode}' }}` : `style='display:${displayMode}'`;
                        let data = hasChildren ? formatStart(node, isReact, styles) : '';

                        for (let i = 0; i < nodes.length; i++) {
                            let n = nodes[i];
                            if (n.nodeType !== 3 && (n instanceof SVGElement) === false) {
                                data += convertNodeToSkeleton(n, isReact);
                            } else {
                                let nClassName = (n instanceof SVGElement) ? n.getAttribute("class") : ''; //keep svg class

                                let dp = window.getComputedStyle(n.parentNode).getPropertyValue("display").replace('inline', 'inline-block');
                                let h = parseInt(window.getComputedStyle(n.parentNode).getPropertyValue("height"));
                                let w = parseInt(window.getComputedStyle(n.parentNode).getPropertyValue("width"));
                                let lh = parseInt(window.getComputedStyle(n.parentNode).getPropertyValue("line-height"));

                                //if the child is the parent
                                if (!hasChildren && nClassName === '') {
                                    nClassName = n.parentNode.getAttribute("class");
                                }

                                if (isReact) {
                                    if (lh > 0 && Number.isNaN(w)) {
                                        data += `<div className='${nClassName}' style={{'display':'${dp}'}}>\n<Skeleton width='80%' height={${lh}} />\n</div>\n`
                                    } else {
                                        data += `<div className='${nClassName}' style={{'display':'${dp}'}}><Skeleton width={${w}} height={${h}}/>\n</div>\n`
                                    }
                                } else {
                                    if (lh > 0 && Number.isNaN(w)) {
                                        data += `<div class="${skClassName} ${nClassName}" style="width:80%;height:${lh}px;display:${dp}"></div>\n`
                                    } else {
                                        data += `<div class="${skClassName} ${nClassName}" style="width:${w}px;height:${h}px;display:${dp}"></div>\n`
                                    }
                                }
                            }
                        }
                        return data + (hasChildren ? formatEnd(node, isReact) : '');
                    }
                    return '';
                }

                //Convert to a skeleton
                let reactResult = convertNodeToSkeleton($0, true);
                let htmlResult = convertNodeToSkeleton($0, false);
                return { 'react': reactResult, 'html': htmlResult }
            }

            sidebar.setExpression(
                "(" + createSkeleton + ")()"
            );
        }

        updateContent();

        panels
            .elements
            .onSelectionChanged
            .addListener(updateContent);
    });