<template>
  <div class="chat-app">
    <div class="chat-content">
      <!-- 聊天区域 -->
      <div class="chat-main">
        <div v-if="data.messages.length === 0" class="chat-header">
          有什么可以帮到你？
        </div>
        <div ref="chatListRef" v-else class="chat-list">
          <div
            v-for="(msg, index) in data.messages"
            :key="index"
            :style="msg.role === 'user' && 'justify-content: flex-end '"
            class="chat-message"
          >
            <div v-if="msg.role === 'user'" class="user-chat">
              <div class="user-message">{{ msg.content }}</div>
            </div>
            <div v-else class="ai-chat">
              <div class="ai-message" v-html="formatMessage(msg.content)"></div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <a-auto-complete
            v-model="data.msg"
            :options="options"
            @select="onSelect"
          >
            <a-textarea placeholder="你有什么想要了解的问题吗" />
          </a-auto-complete>
          <div class="chat-input-actions">
            <div class="dt-btn-gradient" @click="sendMessage">
              <div>
                <img :src="jh" class="tool-img-left" />
                <img :src="at" class="tool-img-left" />
              </div>
              <div>
                <img :src="xh" class="tool-img" />
                <!-- <img @click="handelClick(true)" :src="xh" class="tool-img" /> -->
                <img :src="mk" class="tool-img" />
                <img :src="sc" class="tool-img" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { chatConversations } from '@/api/chat';
import jh from '@/assets/images/tool/jh.png';
import at from '@/assets/images/tool/at.png';
import xh from '@/assets/images/tool/xh.png';
import sc from '@/assets/images/tool/sc.png';
import mk from '@/assets/images/tool/mk.png';

// Prefer Vite env, fallback to process.env for compatibility
const chatUrl = '';
const chatSecret = '';

const chatListRef = ref(null);
const history = ref([]);
const aotoOpen = ref(false);
const options = ref([{ value: '基于ABM-LLM写一个等离子刻蚀设备中晶圆转移的自动化传输系统的调度程序' }, { value: '等离子刻蚀设备结构' }]);

const data = reactive({
  messages: [
    {
      role: 'user',
      content: '基于ABM-LLM写一个等离子刻蚀设备中晶圆转移的自动化传输系统的调度程序；等离子刻蚀设备结构包含：晶圆盒4个，每个盒子10层；晶圆寻边器1个；大气机械臂为双机械臂；Load&nbsp;Lock1个；刻蚀腔室6个；真空机械臂为双机械臂；清洗腔2个；说明一下大气机械臂和真空机械臂是两套独立的双机械臂系统'
    },
    {
      role: 'ai',
      content: '我将为您创建一个基于&nbsp;ABM-LLM&nbsp;的等离子刻蚀设备晶圆传输系统调度程序。这个模拟将包含您提到的所有组件：4&nbsp;个晶圆盒&nbsp;(每个&nbsp;10&nbsp;层)、1&nbsp;个晶圆寻边器、大气双机械臂、1&nbsp;个&nbsp;Load&nbsp;Lock、6&nbsp;个刻蚀腔室、真空双机械臂和&nbsp;2&nbsp;个清洗腔。'
    },
    {
      role: 'ai',
      content: '这个模拟程序实现了等离子刻蚀设备中晶圆的完整传输和处理流程，主要特点包括：<br /> <br />1、系统组件建模：包含了所有您提到的设备组件，包括&nbsp;4&nbsp;个晶圆盒&nbsp;(每盒&nbsp;10&nbsp;层)、晶圆寻边器、大气双机械臂、Load&nbsp;Lock、6&nbsp;个刻蚀腔室、真空双机械臂和&nbsp;2&nbsp;个清洗腔。<br /> <br />2、晶圆处理流程：模拟了晶圆从晶圆盒取出，经过对准、Load&nbsp;Lock&nbsp;传送、刻蚀、清洗，最后返回晶圆盒的完整流程。<br /><br />您可以通过修改代码中的时间范围参数来调整各步骤的处理时间，也可以调整晶圆数量来测试不同负载下的系统性能。运行程序后，会输出详细的日志信息，展示每个晶圆在各环节的处理情况和时间节点。'
    },
  ],
  msg: '',
  conversation_id: '',
  originalPosition: {},
  isStreaming: false,
});

const onSelect = (value) => {
  console.log('onSelect', value);
};

const handelClick = (falg) => {
  aotoOpen.value = falg;
}

// 获取历史会话
async function getHistoryChat() {
  try {
    const res = await chatConversations({ user: '123' });
    if (res?.data) {
      history.value = res.data.map((item) => ({
        id: item.id,
        title: item.name,
      }));
      console.log('history', history.value);
    }
  } catch (e) {
    console.error('getHistoryChat error', e);
  }
}

onMounted(() => {
  getHistoryChat();
});

function scrollToBottom() {
  const chatRef = document.querySelector('.chat-list');
  if (chatRef) {
    requestAnimationFrame(() => {
      chatRef.scrollTop = chatRef.scrollHeight;
    });
  }
}

// 格式化消息内容
function formatMessage(content) {
  if (!content) return '';
  try {
    return content.replace(/\n/g, '<br>');
  } catch (error) {
    console.error('Error formatting message:', error);
    return content;
  }
}

// 发送对话消息
async function sendMessage() {
  const question = data.msg.trim();
  if (!question) return;

  data.messages.push({ role: 'user', content: question });
  const aiMessage = { role: 'assistant', content: '' };
  data.messages.push(aiMessage);
  data.msg = '';
  data.isStreaming = true;

  scrollToBottom();

  try {
    const params = {
      query: question,
      inputs: {},
      response_mode: 'streaming',
      user: '123',
      conversation_id: data.conversation_id || '',
    };
    const response = await fetch(`${chatUrl}/v1/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${chatSecret}`,
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      console.error('Fetch SSE error:', response.statusText);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let receivedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedText += decoder.decode(value, { stream: true });

      const lines = receivedText.split('\n');
      receivedText = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const aiData = line.slice(6).trim();
            const chat = JSON.parse(aiData);
            if (chat.event === 'message_end') {
              data.conversation_id = chat.conversation_id;
              await getHistoryChat();
              data.isStreaming = false;
              return;
            }
            aiMessage.content += chat.answer;

            scrollToBottom();
          } catch (err) {
            console.error('Error parsing SSE chunk', err);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    data.isStreaming = false;
  }
}
</script>

<style scoped>
.chat-app {
  position: fixed;
  top: 90px;
  left: 20px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  transform-origin: 0 0;
  background: rgba(255,255,255,0.85);
  border-radius: 4px;
  border: 1px solid #D5DBE0;
}

:deep(.ant-select-dropdown) {
    z-index: 9999 !important;
}

.chat-app.is-fullscreen {
  border-radius: 0;
}

.chat-content {
  display: flex;
  height: calc(100vh - 120px);
  width: 400px;
}

.dt-btn-default {
  width: 100%;  
}

.tool-img-left {
  width: 12px;
  height: 12px;
  margin-right: 8px;
  cursor: pointer;
}

.tool-img {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  cursor: pointer;
}

/* 右边聊天区 */
.chat-main {
  flex: 1;
  padding: 0 20px;
  position: relative;
  background: var(--background-color-base-3);
}

.chat-header {
  padding: 20px;
  font-weight: bold;
  font-size: 28px;
  height: calc(100% - 180px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-list {
  padding: 20px 0px 0 0px;
  box-sizing: border-box;
  flex-grow: 1;
  overflow-y: auto;
  height: calc(100% - 180px);
}

.chat-message {
  display: flex;
  margin-bottom: 15px;
}

.user-chat {
  display: flex;
}

.user-message {
  display: inline-block;
  padding: 4px 12px;
  color: var(--text-color-2);
  background: #F5F5F5;
  border-radius: 4px;
  word-wrap: break-word;
  word-break: break-word;
  text-align: left;
  line-height: 1.8;
}

.ai-chat {
  display: flex;
}

.ai-message {
  text-align: left;
  padding: 6px 12px;
  color: var(--text-color-2);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.ai-message :deep(pre) {
  background-color: var(--background-color-base-4);
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
}

.ai-message :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.45;
  color: var(--text-color-2);
}

.ai-message :deep(p) {
  margin: 10px 0;
  color: var(--text-color-2);
}

.ai-message :deep(blockquote) {
  border-left: 4px solid var(--line-1);
  padding-left: 16px;
  margin: 10px 0;
  color: var(--text-color-3);
}

/* 输入区 */
.chat-input {
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: sticky;
  background: #FAFAFA;
  border-radius: 4px;
  border: 1px solid #D5DBE0;
}

.chat-input textarea {
  width: 100%;
  height: 80px;
  resize: none;
  padding: 10px;
  font-size: 14px;
  border: var(--menu-border-1);
  border-radius: 4px;
  background: var(--background-color-base-5);
  color: var(--text-color-2);
  outline: none;
}

.chat-input textarea::placeholder {
  color: var(--text-color-4);
}

.chat-input-actions {
  margin-top: 10px;
  width: 100%;
  align-self: flex-end;
}

.dt-btn-gradient {
  display: flex;
  justify-content: space-between;
}

.dt-btn-gradient:hover {
  background: linear-gradient(
    90deg,
    var(--gradient-start-color-hover),
    var(--gradient-end-color-hover)
  );
}
</style>
