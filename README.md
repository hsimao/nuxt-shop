## Nuxt SSR 商店

#### 使用框架 Nuxtjs、bulma css

#### 資料庫 Firebase

#### 部署空間 VPS https://www.linode.com/

### demo https://nuxt-shop.hsimao.org/

### docker

build image

```bash
docker image build -t nuxt-shop:1.0
```

run container

```bash
docker container run -p 8080:3003 -d --name nuxt-shop-container nuxt-shop:1.0
```
