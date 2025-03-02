document.addEventListener('DOMContentLoaded', () => {
    // Configuration constants and state variables
    const MAX_MODELS = 4; // Hard limit for UI performance and space
    let selectedModels = 0; // Track how many models are currently selected
    
    // Cache important DOM elements for performance
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="model"]');
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const responseGrid = document.querySelector('.response-grid');
    const modelCounter = document.querySelector('.model-counter span');

    // Theme management - detect system preference and set up toggle
    const themeSwitch = document.querySelector('.theme-switch-button');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initialize theme based on system preference
    if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeButton('dark');
    }

    // Set up theme toggle button click handler
    themeSwitch.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeButton(newTheme);
    });

    // Update theme button icon and text based on current theme
    function updateThemeButton(theme) {
        const icon = themeSwitch.querySelector('.theme-icon');
        const text = themeSwitch.querySelector('.theme-text');
        
        if (theme === 'dark') {
            icon.textContent = '🌙'; // Moon icon for dark mode
            text.textContent = 'Dark';
        } else {
            icon.textContent = '🌞'; // Sun icon for light mode
            text.textContent = 'Light';
        }
    }

    // Set up model checkboxes with selection limit enforcement
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (checkbox.checked) {
                // Check if we've hit the selection limit
                if (selectedModels >= MAX_MODELS) {
                    checkbox.checked = false; // Undo the selection
                    alert(`Maximum ${MAX_MODELS} models can be selected`);
                    return;
                }
                selectedModels++;
            } else {
                selectedModels--;
            }
            
            // Update the counter display and manage checkbox disabled states
            modelCounter.textContent = `${selectedModels}/${MAX_MODELS}`;
            checkboxes.forEach(cb => {
                if (!cb.checked) {
                    // Only disable unchecked boxes when at the limit
                    cb.disabled = selectedModels >= MAX_MODELS;
                }
            });
        });
    });

    // Handle generate button click - core functionality
    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        
        // Validate inputs before proceeding
        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }

        if (selectedModels === 0) {
            alert('Please select at least one model');
            return;
        }

        // Update UI to show processing state
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        
        // Clear any previous responses to start fresh
        responseGrid.innerHTML = '';
        
        // Set grid layout based on number of models for optimal display
        const selectedModelElements = document.querySelectorAll('input[type="checkbox"][name="model"]:checked');
        responseGrid.classList.remove('single-model', 'multi-model');
        responseGrid.classList.add(selectedModelElements.length === 1 ? 'single-model' : 'multi-model');
        
        // Track completion for proper button re-enabling
        let completedResponses = 0;
        const totalResponses = selectedModelElements.length;
        
        // Generate a response for each selected model
        selectedModelElements.forEach(modelElement => {
            const modelId = modelElement.value;
            
            // Create a dedicated response card for this model
            const responseCard = document.createElement('div');
            responseCard.className = 'model-response-card';
            responseCard.id = `response-${modelId}`;
            responseGrid.appendChild(responseCard);
            
            // Initially show loading state
            displayLoadingState(responseCard, modelId);
            
            // Set a fixed 3-second timeout to replace with response
            setTimeout(() => {
                displayResponseContent(responseCard, modelId, prompt);
                
                // Track completion
                completedResponses++;
                if (completedResponses >= totalResponses) {
                    // All responses are loaded, re-enable button
                    generateBtn.disabled = false;
                    generateBtn.textContent = 'Generate Responses';
                }
            }, 3000);
        });
    });
    
    // Display loading state within an existing card
    function displayLoadingState(cardElement, modelId) {
        const modelNames = {
            'gemini-flash': 'Gemini Flash',
            'gemini-pro': 'Gemini Pro',
            'gpt-4o': 'GPT-4o',
            'gpt-4-turbo': 'GPT-4 Turbo',
            'gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'claude-3-opus': 'Claude 3 Opus',
            'claude-3-sonnet': 'Claude 3 Sonnet',
            'claude-3-haiku': 'Claude 3 Haiku'
        };
        
        cardElement.innerHTML = `
            <div class="model-header">
                <div class="model-title">
                    <h3 class="model-name">${modelNames[modelId] || modelId}</h3>
                    <span class="model-tags">Generating response...</span>
                </div>
                <div class="model-meta">
                    <span class="response-time">⏱️ --</span>
                    <span class="token-count">📊 -- tokens</span>
                </div>
            </div>
            <div class="response-content">
                <div class="loading-container">
                    <div class="wave-loading">
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                    </div>
                    <div class="loading-text">
                        AI is thinking...
                    </div>
                </div>
            </div>
            <div class="response-actions">
                <button class="remove-btn" disabled>Remove Response</button>
                <div class="action-buttons-right">
                    <button class="copy-btn" disabled>Copy Response</button>
                    <button class="regenerate-btn" disabled>Regenerate</button>
                </div>
            </div>
        `;
    }
    
    // Display actual response content within an existing card
    function displayResponseContent(cardElement, modelId, prompt) {
        // Model-specific tags
        const modelTags = {
            'gemini-flash': 'Ultra-fast • Experimental',
            'gemini-pro': 'Advanced • High Precision',
            'gpt-4o': 'Latest • Multimodal',
            'gpt-4-turbo': 'Powerful • Updated Knowledge',
            'gpt-3.5-turbo': 'Fast • Cost Effective',
            'claude-3-opus': 'Premium • Highest Quality',
            'claude-3-sonnet': 'Balanced • General Purpose',
            'claude-3-haiku': 'Fast • Efficient'
        };

        // Response times 
        const responseTimes = {
            'gemini-flash': '0.8s',
            'gemini-pro': '1.7s',
            'gpt-4o': '2.2s',
            'gpt-4-turbo': '1.9s',
            'gpt-3.5-turbo': '1.1s',
            'claude-3-opus': '2.6s',
            'claude-3-sonnet': '1.8s',
            'claude-3-haiku': '0.9s'
        };

        // Token counts - generate random counts for each model
        const tokenCount = Math.floor(Math.random() * 800) + 200;
        
        // Get default response content based on model type and prompt
        const responseContent = getDefaultResponse(modelId, prompt);
        
        // Update model header information
        const modelHeader = cardElement.querySelector('.model-header');
        if (modelHeader) {
            modelHeader.querySelector('.model-tags').textContent = modelTags[modelId] || '';
            modelHeader.querySelector('.response-time').textContent = `⏱️ ${responseTimes[modelId] || '2.0s'}`;
            modelHeader.querySelector('.token-count').textContent = `📊 ${tokenCount} tokens`;
        }
        
        // Update response content
        const responseContentDiv = cardElement.querySelector('.response-content');
        if (responseContentDiv) {
            responseContentDiv.innerHTML = responseContent;
        }
        
        // Enable all buttons
        const buttons = cardElement.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.disabled = false;
        });
        
        // Add button event handlers
        const removeBtn = cardElement.querySelector('.remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                cardElement.remove();
            });
        }
        
        const copyBtn = cardElement.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                // Extract text from HTML for copying
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = responseContent;
                const textToCopy = tempDiv.textContent || tempDiv.innerText || "Default response";
                
                navigator.clipboard.writeText(textToCopy);
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.textContent = 'Copy Response', 2000);
            });
        }
        
        const regenerateBtn = cardElement.querySelector('.regenerate-btn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                // Disable buttons during regeneration
                cardElement.querySelectorAll('button').forEach(btn => {
                    btn.disabled = true;
                });
                
                // Show loading state
                responseContentDiv.innerHTML = `
                    <div class="loading-container">
                        <div class="wave-loading">
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                        </div>
                        <div class="loading-text">Regenerating response...</div>
                    </div>
                `;
                
                // After exactly 3 seconds, show slightly different response
                setTimeout(() => {
                    const newResponse = getDefaultResponse(modelId, prompt, true);
                    responseContentDiv.innerHTML = newResponse;
                    
                    // Re-enable buttons after regeneration
                    cardElement.querySelectorAll('button').forEach(btn => {
                        btn.disabled = false;
                    });
                }, 3000);
            });
        }
    }

    // Generate appropriate default responses based on model type and prompt
    function getDefaultResponse(modelId, prompt, isRegeneration = false) {
        // Extract some simple features from the prompt to tailor response
        const promptLower = prompt.toLowerCase();
        const isQuestion = promptLower.includes('?');
        const isGreeting = promptLower.includes('hello') || promptLower.includes('hi ');
        const isAboutCode = promptLower.includes('code') || promptLower.includes('programming') || promptLower.includes('function');
        const isExplanation = promptLower.includes('explain') || promptLower.includes('what is');
        
        // Very basic response templates
        let response = '';
        
        if (isGreeting) {
            response = `<p>Hello! I'm a demo ${modelId} response. How can I assist you today?</p>`;
            if (!isRegeneration) {
                response += `<p>This is a simulated response in the boilerplate version. No actual AI processing is happening.</p>`;
            } else {
                response += `<p>This is a regenerated simulated response. In a real implementation, this would be a new response from the AI.</p>`;
            }
        } else if (isAboutCode) {
            response = `<h3>Code Example</h3>`;
            response += `<p>Here's a sample code snippet that might help with your request:</p>`;
            response += `<pre><code>function demoFunction() {
  // This is a simulated code response
  const data = ["item1", "item2", "item3"];
  
  // Process the data
  return data.map(item => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      value: item,
      processed: true
    };
  });
}

// Example usage
const result = demoFunction();
console.log(result);
</code></pre>`;
            response += `<p>This is just a demonstration. In a real implementation, the AI would analyze your specific request and provide relevant code.</p>`;
        } else if (isExplanation) {
            response = `<h3>Explanation</h3>`;
            response += `<p>This is a simulated explanation response to your query.</p>`;
            response += `<p>In a real implementation, the AI would provide a detailed explanation about the topic you asked about. The explanation would be:</p>`;
            response += `<ul>
                <li>Comprehensive and accurate</li>
                <li>Based on the AI's training data</li>
                <li>Tailored to your specific question</li>
                <li>Structured in a way that's easy to understand</li>
            </ul>`;
            response += `<p>If you have more questions about this topic, feel free to ask!</p>`;
        } else if (isQuestion) {
            response = `<h3>Response</h3>`;
            response += `<p>This is a simulated answer to your question.</p>`;
            response += `<p>In a real implementation, the AI would analyze your question and provide a relevant answer based on its knowledge and capabilities.</p>`;
            response += `<p>The answer would be tailored to the specific model you selected (${modelId}).</p>`;
        } else {
            // Default general response
            response = `<h3>Response</h3>`;
            response += `<p>This is a simulated response from ${modelId}.</p>`;
            response += `<p>In a full implementation, this would contain a genuine AI response based on your prompt:</p>`;
            response += `<blockquote>${prompt}</blockquote>`;
            response += `<p>Different AI models would provide different responses with varying styles, depths, and approaches.</p>`;
        }
        
        // Add model-specific signature based on provider
        if (modelId.startsWith('gpt')) {
            response += `<p><em>Generated by OpenAI's ${modelId} (demo)</em></p>`;
        } else if (modelId.startsWith('gemini')) {
            response += `<p><em>Generated by Google's ${modelId} (demo)</em></p>`;
        } else if (modelId.startsWith('claude')) {
            response += `<p><em>Generated by Anthropic's ${modelId} (demo)</em></p>`;
        }
        
        return response;
    }
});