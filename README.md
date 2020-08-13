<img src="https://luckeyproductions.nl/tank/images/tank.png" width="100" height="100">

# Urho3D Tank - Web IDE
## Requirements
Build [Urho3D-Tank-Web-IDE-Sample](https://github.com/ArnisLielturks/Urho3D-Tank-Web-IDE-Sample) and copy the `55_TankPrototype.*` files to the `public/`
directory of this project

---

## How to build

There are 2 approaches how the project can be built:

### 1. Build everything locally

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run serve

# build for production with minification
npm run build
```

When `npm run build` command is finished, it will generate a `dist` directory, which will contain everything you need to set up your own Urho3D-Tank web IDE.

Here's a simple script to start a local nginx web server which serves the compiled `dist` directory

```bash
# Start a server on http://127.0.0.1:7777
docker run --rm -it -p 7777:80  -v $(pwd)/dist:/usr/share/nginx/html nginx
```

---

### 2. Build using docker

```bash
# Build the image
docker build -t urho3d-tank-web-ide .

# Start the app on http://127.0.0.1:7777
docker run -it -p 7777:80 urho3d-tank-web-ide
```

---

# Contributors
<a href="https://github.com/Modanung"><img alt="Modanung" src="https://avatars3.githubusercontent.com/u/7316241?s=1&v=4" width="100" height="100"></a>
<a href="https://github.com/ArnisLielturks"><img alt="Arnis Lielturks" src="https://avatars3.githubusercontent.com/u/7426555?s=460&u=c1dbfbb97dfe5468ae0d5e8ba4fd1e3ce838b927&v=4" width="100" height="100"></a>

---

## Additional information
### Projects used:
* [zmts/beauty-vuejs-boilerplate](https://github.com/zmts/beauty-vuejs-boilerplate)
* [luckeyproductions/tank](https://gitlab.com/luckeyproductions/tank)

[Urho3D Forum Discussion](https://discourse.urho3d.io/t/urho-tank-web-ide/6294)
