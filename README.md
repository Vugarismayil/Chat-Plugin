# Canlı Destek Sistemi

Bu proje, web sitenize kolayca entegre edebileceğiniz bir canlı destek sistemidir.

## Özellikler

- Real-time mesajlaşma
- Özelleştirilebilir widget tasarımı
- Admin panel desteği
- Oturum yönetimi
- Responsive tasarım

## Kurulum

1. Gerekli paketleri yükleyin:
```bash
npm install
```

2. `.env` dosyasını oluşturun:
```
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=şifreniz
JWT_SECRET=gizli-anahtarınız
```

3. Sunucuyu başlatın:
```bash
npm start
```

## Widget Entegrasyonu

Web sitenize aşağıdaki kodu ekleyin:

```html
<script src="http://localhost:3000/widget.js"></script>
<script>
  new LiveChatWidget({
    serverUrl: 'http://localhost:3000',
    position: 'bottom-right',
    theme: {
      primary: '#2196f3',
      secondary: '#ffffff'
    }
  });
</script>
```

## Admin Panel Kullanımı

1. `http://localhost:3000/admin` adresine gidin
2. Kullanıcı adı ve şifrenizle giriş yapın
3. Aktif sohbetleri görüntüleyin ve yanıtlayın

## Lisans

MIT 