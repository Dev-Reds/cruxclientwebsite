<script setup>
const { t } = useI18n()
useHead({ title: t('index.launcher') })
</script>

<template>
  <div>

<h1>
    {{ t('index.launcher') }}
</h1>

 
    <div class="download-box">
            
        <a href="https://github.com/Dev-Reds/crux-client/releases/latest/download/Crux-Client-Installer.exe" class="download-btn">
            <span class="btn-title">{{ t('launcher.windows') }}</span>
            <span class="btn-sub">installer.exe</span></a>

        <a href="https://github.com/Dev-Reds/crux-client/releases/latest/download/Crux-Client-Linux-x64.zip" class="download-btn">
            <span class="btn-title">{{ t('launcher.linux') }}</span>
            <span class="btn-sub">Linux-x64-installer.zip</span></a>

        <a href="https://github.com/Dev-Reds/crux-client/releases/latest/download/Crux-Client-Mac-Installer.zip" class="download-btn">
            <span class="btn-title">{{ t('launcher.mac') }}</span>
            <span class="btn-sub">Mac-Installer.zip</span></a>
            
    </div>

    





  </div>
</template>

<style scoped>
h1 {
  color: rgb(188, 0, 0);
  font-size: clamp(20px, 5vw, 30px);
  text-align: center;
}


        .download-box {
            margin: 25px 0px;
            width: 100%;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
        }

        .download-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 0px auto;
            background-color: #b50000;
            color: #bbbbbb;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 14px;
            transition: background-color 0.2s;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .btn-title {
            font-size: 14px;
        }
        .btn-sub {
            font-size: 10px;
            opacity: 0.7;
        }

        .download-btn:hover {
            background-color: #ff0000;
        }

        @media (max-width: 460px) {
            .download-box {
                flex-direction: column;
                align-items: center;
            }
        }

        .code-panels-row {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 20px;
            padding: 0 10px;
            box-sizing: border-box;
        }
</style>

