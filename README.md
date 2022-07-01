前台：[Demo Site](https://oauthhomework.herokuapp.com/) <br/>
後台：[Demo Site](https://oauthhomework.herokuapp.com/admin)

```bash
# environments/.env

LINE_LOGIN_CLIENT_ID=Line login clientId
LINE_LOGIN_SECRET=Line login secret
LINE_LOGIN_CALLBACK=Line login callback url

LINE_NOTIFY_CLIENT_ID=Line notify clientId
LINE_NOTIFY_SECRET=Line notify secret
LINE_NOTIFY_CALLBACK=Line notify callback url
```

安裝：
程式運作在Nodejs上，同時需要在本機電腦上安裝 NestJS Cli，[官網](https://docs.nestjs.com/)<br/>
程式沒有實作持久化的機制，所以服務重啟後，所有註冊的資料便會消失。

```
npm install

# 開發(預設3000 port)
npm run start:dev

```


首頁：
<img width="1109" alt="Screen Shot 2022-07-01 at 19 08 56" src="https://user-images.githubusercontent.com/45646234/176883488-3a547c8b-e4ee-4aa7-9800-42054efc692d.png">

登入：
<img width="1210" alt="Screen Shot 2022-07-01 at 19 10 01" src="https://user-images.githubusercontent.com/45646234/176883559-44566c2c-9a0d-4f4b-9d6b-ae06d8975c31.png">

連動Line Notify：
<img width="1182" alt="Screen Shot 2022-07-01 at 19 10 39" src="https://user-images.githubusercontent.com/45646234/176883668-36bb3299-69a8-4e9c-8dea-21180e28640f.png">

後台發送訊息：
<img width="1142" alt="Screen Shot 2022-07-01 at 19 11 21" src="https://user-images.githubusercontent.com/45646234/176883745-c72dde4e-2f6b-4ed9-911b-de9fd4f6da4d.png">
