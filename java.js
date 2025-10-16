document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const shortenBtn = document.getElementById('shorten-btn');
    const resultsContainer = document.getElementById('results-container');
    const errorMessage = document.querySelector('.error-message');
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');

    shortenBtn.addEventListener('click', handleShorten);
    menuToggle.addEventListener('click', toggleMenu);

    loadLinks();

    async function handleShorten() {
        const longUrl = urlInput.value.trim();

        hideError();

        if (longUrl === '') {
            showError('Please add a link');
            return;
        }

        const formattedUrl = !longUrl.startsWith('http') ? `https://${longUrl}` : longUrl;

        try {
            const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(formattedUrl)}`);
            const data = await response.json();

            if (data.error) {
                showError('Invalid URL. Please try again.');
                return;
            }

            const shortUrl = data.shorturl;
            displayResult(longUrl, shortUrl);
            saveLink({ original: longUrl, shortened: shortUrl });
            urlInput.value = '';

        } catch (error) {
            console.error('API Error:', error);
            showError('Something went wrong. Please try again later.');
        }
    }

    function displayResult(original, shortened) {
        const resultCard = document.createElement('div');
        resultCard.classList.add('result-card');
        resultCard.innerHTML = `
            <span class="original-url">${original}</span>
            <div class="result-actions">
                <a href="${shortened}" target="_blank" class="shortened-url" rel="noopener noreferrer">${shortened}</a>
                <button class="copy-btn">Copy</button>
            </div>
        `;

        resultsContainer.prepend(resultCard);

        const copyBtn = resultCard.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => copyToClipboard(copyBtn, shortened));
    }

    function copyToClipboard(button, text) {
        navigator.clipboard.writeText(text).then(() => {
            button.textContent = 'Copied!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = 'Copy';
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text:', err);
        });
    }

    function toggleMenu() {
        navbar.classList.toggle('active');
        const isExpanded = navbar.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        urlInput.classList.add('error');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
        urlInput.classList.remove('error');
    }

    function loadLinks() {
        const savedLinks = JSON.parse(localStorage.getItem('shortenedLinks') || '[]');
        savedLinks.forEach(link => {
            displayResult(link.original, link.shortened);
        });
    }

    function saveLink(link) {
        const savedLinks = JSON.parse(localStorage.getItem('shortenedLinks') || '[]');
        savedLinks.unshift(link);
        localStorage.setItem('shortenedLinks', JSON.stringify(savedLinks));
    }
});