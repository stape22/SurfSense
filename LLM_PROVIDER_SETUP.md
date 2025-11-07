# How to Set Up LLM Provider for SurfSense

## Overview

SurfSense needs an LLM (Large Language Model) provider to enable chat and research features. You have two main options:

1. **Ollama** (Recommended for local setup) - Free, runs locally, no API key needed
2. **Cloud Providers** - OpenAI, Anthropic, Groq, etc. - Requires API keys

---

## Option 1: Set Up Ollama (Local, Free, Recommended)

### Step 1: Install Ollama

**Windows:**
1. Download Ollama from: https://ollama.com/download
2. Run the installer
3. Ollama will start automatically

**Verify Installation:**
- Open PowerShell and run: `ollama --version`
- Should show version number

### Step 2: Download a Model

Download a model (this may take a few minutes depending on size):

```powershell
# Small, fast model (recommended for testing)
ollama pull llama3.2

# Or larger, more capable model
ollama pull llama3.1:8b

# Or even larger (requires more RAM)
ollama pull llama3:70b
```

**Recommended for testing:** `llama3.2` (smallest, fastest)

### Step 3: Configure in SurfSense

1. In the SurfSense onboarding screen, click **"+ Add Provider"**
2. Fill in the form:
   - **Configuration Name**: `My Local LLM` (or any name you like)
   - **Provider**: Select **"Ollama"** from dropdown
   - **Model Name**: Enter `llama3.2` (or whatever model you downloaded)
   - **API Key**: Enter `ollama` (Ollama doesn't require a real API key, but the field is required)
   - **API Base URL**: Enter `http://localhost:11434` (default Ollama port)
   - **Language**: Select your preferred language (default: English)
3. Click **"Add Provider"** or **"Save"**

### Step 4: Verify Setup

1. The onboarding should progress to "Assign LLM Roles"
2. Assign roles to your LLM configuration
3. Complete the setup

**✅ Success**: You can now use chat and research features!

---

## Option 2: Use Cloud Provider (Requires API Key)

### Popular Options:

#### A. OpenAI (GPT-4, GPT-3.5)
- **Provider**: Select "OpenAI"
- **Model Name**: `gpt-4o` or `gpt-3.5-turbo`
- **API Key**: Get from https://platform.openai.com/api-keys
- **API Base URL**: Leave empty (uses default)

#### B. Anthropic (Claude)
- **Provider**: Select "Anthropic"
- **Model Name**: `claude-3-5-sonnet-20241022` or `claude-3-opus-20240229`
- **API Key**: Get from https://console.anthropic.com/
- **API Base URL**: Leave empty

#### C. Groq (Fast, Free Tier Available)
- **Provider**: Select "Groq"
- **Model Name**: `llama3-70b-8192` or `mixtral-8x7b-32768`
- **API Key**: Get from https://console.groq.com/
- **API Base URL**: Leave empty

#### D. OpenRouter (Access Multiple Models)
- **Provider**: Select "OpenRouter"
- **Model Name**: `anthropic/claude-opus-4.1` or `openai/gpt-4o`
- **API Key**: Get from https://openrouter.ai/keys
- **API Base URL**: Leave empty

### Configuration Steps:

1. Get API key from your chosen provider
2. In SurfSense onboarding, click **"+ Add Provider"**
3. Fill in:
   - **Configuration Name**: `My OpenAI` (or descriptive name)
   - **Provider**: Select your provider
   - **Model Name**: Enter model name (see examples above)
   - **API Key**: Paste your API key
   - **API Base URL**: Usually leave empty (uses provider default)
   - **Language**: Select your language
4. Click **"Add Provider"**

---

## Quick Test Setup (Ollama)

**Fastest way to get started:**

```powershell
# 1. Install Ollama (if not installed)
# Download from https://ollama.com/download

# 2. Pull a small model
ollama pull llama3.2

# 3. Verify it's running
ollama list
```

Then in SurfSense:
- Provider: **Ollama**
- Model: **llama3.2**
- API Key: **ollama** (any value works)
- API Base: **http://localhost:11434**

---

## Troubleshooting

### Ollama Issues

**"Connection refused" error:**
- Make sure Ollama is running: `ollama serve` (or restart Ollama app)
- Check port 11434 is not blocked by firewall
- Verify: `curl http://localhost:11434/api/tags`

**"Model not found" error:**
- Make sure you downloaded the model: `ollama pull llama3.2`
- Check available models: `ollama list`

**Slow responses:**
- Use a smaller model (llama3.2 instead of llama3:70b)
- Check your RAM/CPU usage
- Consider using a cloud provider for faster responses

### Cloud Provider Issues

**"Invalid API key" error:**
- Verify API key is correct (no extra spaces)
- Check API key hasn't expired
- Ensure you have credits/quota remaining

**"Model not found" error:**
- Verify model name is correct (check provider's documentation)
- Some providers require specific model naming format

---

## Supported Providers

SurfSense supports these LLM providers:

- **Local**: Ollama
- **Cloud**: OpenAI, Anthropic, Groq, Cohere, Google (Gemini), Mistral, Together AI, Replicate, OpenRouter, CometAPI
- **Enterprise**: Azure OpenAI, AWS Bedrock
- **Chinese**: DeepSeek, Qwen (Alibaba), Kimi (Moonshot), GLM (Zhipu)
- **Custom**: Custom Provider (for your own endpoints)

---

## Next Steps After Setup

1. ✅ Add at least one LLM provider
2. ✅ Assign LLM roles (strategic, tactical, operational)
3. ✅ Complete onboarding
4. ✅ Start chatting with your documents!

---

## Recommended Setup for Testing

**For quick testing:**
- Use **Ollama** with **llama3.2** model
- Fast, free, works offline
- No API keys needed

**For production use:**
- Use **OpenRouter** or **Groq** for fast responses
- Or **OpenAI** / **Anthropic** for best quality
- Requires API keys but offers better performance

