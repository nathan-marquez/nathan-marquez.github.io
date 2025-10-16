/**
 * Blog System - Markdown to HTML Parser
 * 
 * Features:
 * - Parses markdown files with YAML frontmatter
 * - Extracts title, date, thumbnail (image/video)
 * - Two rendering modes: preview (About page) and full (Portfolio page)
 * - Auto-detects video files and converts to <video> tags
 * 
 * Dependencies: marked.js (loaded via CDN)
 */

// Pagination state
let currentPage = 1;
const POSTS_PER_PAGE = 5;
let totalPosts = 0;

/**
 * Load and render blog posts
 * @param {number|null} limit - Maximum number of posts to display (null = all)
 * @param {number} page - Current page number for pagination (1-indexed)
 */
async function loadPosts(limit = null, page = 1) {
    // Determine which container we're rendering to
    const feedContainer = document.getElementById('posts-feed');        // Portfolio page
    const previewContainer = document.getElementById('posts-preview');  // About page
    const container = feedContainer || previewContainer;
    
    // Validation
    if (!container) {
        console.error('Posts container not found');
        return;
    }
    
    if (typeof marked === 'undefined') {
        console.error('Marked library not loaded');
        container.innerHTML = '<p>Error: Blog system not loaded properly.</p>';
        return;
    }
    
    const isPreview = !!previewContainer;
    
    try {
        // Fetch list of post filenames from posts.json
        const postsResponse = await fetch('posts.json');
        const postFiles = await postsResponse.json();
        
        totalPosts = postFiles.length;
        
        // Apply limit for preview mode OR pagination for full feed
        let filesToShow;
        if (limit) {
            // Preview mode: show limited posts
            filesToShow = postFiles.slice(0, limit);
        } else if (!isPreview) {
            // Full feed mode: apply pagination
            const startIndex = (page - 1) * POSTS_PER_PAGE;
            const endIndex = startIndex + POSTS_PER_PAGE;
            filesToShow = postFiles.slice(startIndex, endIndex);
        } else {
            filesToShow = postFiles;
        }
        
        // Process each post
        for (const filename of filesToShow) {
            try {
                // Fetch markdown content
                const postFile = `posts/${filename}`;
                const response = await fetch(postFile);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const markdown = await response.text();
                
                // Parse YAML frontmatter (currently: date)
                let date = null;
                let content = markdown;
                const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
                if (frontmatterMatch) {
                    const frontmatter = frontmatterMatch[1];
                    content = frontmatterMatch[2];
                    const dateMatch = frontmatter.match(/date:\s*(.+)/);
                    if (dateMatch) {
                        date = dateMatch[1].trim();
                    }
                }
                
                // Extract title from first heading
                const titleMatch = content.match(/^#+ (.+)$/m);
                const title = titleMatch ? titleMatch[1] : 'Untitled';
                
                // Extract thumbnail (first image or video)
                const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);
                const videoMatch = content.match(/<video.*?src=["'](.*?)["']/);
                let thumbnail = imageMatch ? imageMatch[1] : (videoMatch ? videoMatch[1] : null);
                
                // Check if thumbnail is a video file (by extension)
                const isVideo = thumbnail && (thumbnail.endsWith('.mp4') || thumbnail.endsWith('.webm') || thumbnail.endsWith('.mov'));
                
                // Create excerpt from first paragraph (strip markdown)
                const paragraphs = content.split('\n\n');
                let excerpt = '';
                let isTruncated = false;
                let hasAdditionalContent = false;
                
                // Find the first text paragraph (skip frontmatter, headers, images, videos)
                let firstTextParagraph = null;
                let firstTextIndex = -1;
                for (let i = 0; i < paragraphs.length; i++) {
                    const para = paragraphs[i];
                    // Skip frontmatter, headers, images, videos
                    if (!para.startsWith('---') && !para.startsWith('#') && !para.startsWith('!') && !para.startsWith('<video')) {
                        firstTextParagraph = para;
                        firstTextIndex = i;
                        break;
                    }
                }
                
                // Check if there's additional content beyond the first text paragraph
                hasAdditionalContent = firstTextIndex >= 0 && firstTextIndex < paragraphs.length - 1;
                
                if (firstTextParagraph) {
                    // Strip all markdown formatting
                    const cleanPara = firstTextParagraph
                        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')  // [text](url) -> text
                        .replace(/[*_`]/g, '');                     // bold, italic, code
                    
                    // Check if we need to truncate the first paragraph
                    if (cleanPara.length > 200) {
                        excerpt = cleanPara.substring(0, 200);
                        isTruncated = true;
                    } else {
                        excerpt = cleanPara;
                        isTruncated = false;
                    }
                }
                
                // Create post DOM element
                const postElement = document.createElement('div');
                postElement.className = isPreview ? 'post-preview' : 'post';
                
                // Add referrer to post URL so we know where to go back
                const referrer = isPreview ? 'index.html' : 'portfolio.html';
                const postUrl = `post.html?file=${encodeURIComponent(postFile)}&from=${referrer}`;
                
                // Format date for display
                const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) : '';
                
                if (isPreview) {
                    // PREVIEW MODE (About page): Simple date + title on one line
                    postElement.innerHTML = `
                        <p class="preview-line">
                            <span class="preview-date">${formattedDate}</span>
                            <a href="${postUrl}" class="preview-title">${title}</a>
                        </p>
                    `;
                } else {
                    // FULL MODE (Portfolio page): Thumbnail + date + title + excerpt
                    let thumbnailHTML = '';
                    if (thumbnail) {
                        if (isVideo || videoMatch) {
                            const videoType = thumbnail.endsWith('.webm') ? 'video/webm' : 'video/mp4';
                            thumbnailHTML = `
                                <a href="${postUrl}" class="post-thumbnail">
                                    <video autoplay loop muted playsinline style="width: 100%; height: auto;">
                                        <source src="${thumbnail}" type="${videoType}">
                                    </video>
                                </a>
                            `;
                        } else {
                            thumbnailHTML = `
                                <a href="${postUrl}" class="post-thumbnail">
                                    <img src="${thumbnail}" alt="${title}" style="width: 100%; height: auto;">
                                </a>
                            `;
                        }
                    }
                    
                    const dateHTML = formattedDate ? `<small class="post-date">${formattedDate}</small>` : '';
                    
                    // Add ellipsis only if first paragraph was truncated
                    const ellipsis = isTruncated ? '... ' : '';
                    
                    // Show "read more" if there's any additional content beyond first paragraph
                    const readMoreLink = hasAdditionalContent ? `<a href="${postUrl}" class="read-more">(read more)</a>` : '';
                    
                    // Add space before read more if there's no ellipsis but there is a read more link
                    const separator = (!isTruncated && hasAdditionalContent) ? ' ' : '';
                    
                    postElement.innerHTML = `
                        ${thumbnailHTML}
                        ${dateHTML}
                        <h3><a href="${postUrl}">${title}</a></h3>
                        <div class="post-excerpt">${excerpt}${ellipsis}${separator}${readMoreLink}</div>
                    `;
                }
                
                container.appendChild(postElement);
            } catch (error) {
                console.error(`Error loading post ${filename}:`, error);
                container.innerHTML += `<p>Error loading post: ${filename}</p>`;
            }
        }
        
        // Add pagination controls for full feed (portfolio page)
        if (!isPreview && feedContainer) {
            renderPagination(page);
        }
    } catch (error) {
        console.error('Error loading posts list:', error);
        container.innerHTML = '<p>Error loading blog posts.</p>';
    }
}

/**
 * Render pagination controls
 * @param {number} currentPage - Current page number
 */
function renderPagination(page) {
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    
    // Remove existing pagination if any
    const existingPagination = document.getElementById('pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    // Only show pagination if there's more than one page
    if (totalPages <= 1) return;
    
    const paginationDiv = document.createElement('div');
    paginationDiv.id = 'pagination';
    paginationDiv.className = 'pagination';
    
    // Previous button
    if (page > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '← Previous';
        prevButton.onclick = () => {
            currentPage--;
            document.getElementById('posts-feed').innerHTML = '';
            loadPosts(null, currentPage);
            window.scrollTo(0, 0);
        };
        paginationDiv.appendChild(prevButton);
    }
    
    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${page} of ${totalPages}`;
    paginationDiv.appendChild(pageInfo);
    
    // Next button
    if (page < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next →';
        nextButton.onclick = () => {
            currentPage++;
            document.getElementById('posts-feed').innerHTML = '';
            loadPosts(null, currentPage);
            window.scrollTo(0, 0);
        };
        paginationDiv.appendChild(nextButton);
    }
    
    // Append after the posts feed
    const feedContainer = document.getElementById('posts-feed');
    feedContainer.parentNode.insertBefore(paginationDiv, feedContainer.nextSibling);
}

/**
 * Initialize blog system when DOM is ready
 */
function initBlog() {
    if (document.getElementById('posts-preview')) {
        loadPosts(4);  // About page: 4 most recent
    } else if (document.getElementById('posts-feed')) {
        loadPosts(null, currentPage);   // Portfolio page: paginated posts
    }
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlog);
} else {
    initBlog();
}
