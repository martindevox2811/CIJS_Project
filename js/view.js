const view = {};

view.setActiveScreen = async (screenName) => {
  switch (screenName) {
    case "registerPage":
      document.getElementById("app").innerHTML = component.registerPage;
      const registerForm = document.getElementById("register-form");
      registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const data = {
          userName: registerForm.userName.value,
          email: registerForm.email.value,
          password: registerForm.password.value,
          confirmPassword: registerForm.confirmPassword.value,
        };
        controller.register(data);
      });
      document.getElementById("redirect-to-login").addEventListener("click", function () {
        view.setActiveScreen("loginPage");
      });
      break;

    case "loginPage":
      document.getElementById("app").innerHTML = component.loginPage;
      const loginForm = document.getElementById("login-form");
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const data = {
          email: loginForm.email.value,
          password: loginForm.password.value,
        };
        controller.login(data);
      });
      document.getElementById('btn_google').addEventListener('click', function () {
        model.logInWithGoogle();
      })
      document.getElementById('btn_facebook').addEventListener('click', function () {
        model.logInWithFacebook();
      })
      document.getElementById("redirect-to-register").addEventListener("click", function () {
        view.setActiveScreen("registerPage");
      });
      break;

    case "homePage":
      document.getElementById("app").innerHTML = component.homePage;
      document.getElementById("log-in").addEventListener("click", () => {
        view.setActiveScreen("loginPage");
      });
      document.getElementById("sign-out").addEventListener("click", () => {
        model.setOffline(firebase.auth().currentUser.uid)
        firebase.auth().signOut();
      });
      break;

    case "gamePage":
      document.getElementById("app").innerHTML = component.gamePage;

      document.getElementById("opt3x3").addEventListener('click', function () {
        game.rule = 3;
        game.size = 3;
        view.setActiveScreen("playPage");
      })
      document.getElementById("opt5x5").addEventListener('click', function () {
        game.rule = 4;
        game.size = 5;
        view.setActiveScreen("playPage");
      })
      document.getElementById("opt10x10").addEventListener('click', function () {
        game.rule = 5;
        game.size = 10;
        view.setActiveScreen("playPage");
      })

      const rankingBtn = document.querySelector(".ranking")
      const listPlayerBtn = document.querySelector(".player")
      rankingBtn.addEventListener('click', () => {
        listPlayerBtn.classList.remove('current')
        rankingBtn.classList.add('current')
        document.querySelector('.rankingList').style = 'display: block'
        document.querySelector('.playerList').style = 'display: none'
      })
      listPlayerBtn.addEventListener('click', () => {
        rankingBtn.classList.remove('current')
        listPlayerBtn.classList.add('current')
        document.querySelector('.rankingList').style = 'display: none'
        document.querySelector('.playerList').style = 'display: block'
      })

      document.getElementById("sign-out").addEventListener("click", () => {
        model.setOffline(firebase.auth().currentUser.uid)
        firebase.auth().signOut();
      });
      await model.listenPresence()
      await model.getPlayer()
      await model.listenAllPlayer()
      model.getNotification()
      break;

    case "playPage":
      document.getElementById("app").innerHTML = component.playPage;

      let board = document.getElementById("board-game")
      for (let i = 0; i < game.size * game.size; i++) {
        const cell = document.createElement('div');
        cell.classList.add("cell");
        cell.setAttribute("data-cell", "")
        board.appendChild(cell);
      }
      var sheet = document.createElement('style')
      sheet.innerHTML = `
      #board-game {
          grid-template-columns: repeat(${game.size}, auto);
      }
      #board-game .cell:nth-child(${game.size}n + 1){
          border-left: none;
      }
      #board-game .cell:nth-child(${game.size}n){
          border-right: none;
      }
      #board-game .cell:nth-child(-n + ${game.size}){
          border-top: none;
      }
      #board-game .cell:nth-child(-n + ${game.size * game.size}){
          border-bottom: none;
      }
      `;
      board.appendChild(sheet);
      document.getElementById('restartButton').addEventListener('click', game.startGame)
      document.getElementById('log-in').style = 'display: none'
      game.startGame()
      model.listenGamesChanges()
      break;
  }
};

view.setErrorMessage = (elementId, content) => {
  document.getElementById(elementId).innerText = content;
};

view.showPlayer = (childData) => {
  document.querySelector('.aside-right .rankingList').innerHTML = ""
  document.querySelector('.aside-right .playerList').innerHTML = ""

  for (player of model.players) {
    view.addPlayer(player)
    let check = false
    for (let i in childData) {
      if (childData[i].state == "online" && player.id == i) {
        view.addListPlayer(player, true)
        check = true
        break
      }
    }
    if (check) continue
    view.addListPlayer(player, false)
  }
}

view.addPlayer = (player) => {
  const infoWrapper = document.createElement('div')
  infoWrapper.classList.add('info')
  infoWrapper.innerHTML = `
  <div class="rank"> 1. </div> 
  <div class="user-name"> ${player.owner} </div> 
  <div class="score"> ${player.points} </div>
  `
  document.querySelector('.aside-right .rankingList').appendChild(infoWrapper)
}

view.addListPlayer = (player, online) => {
  const listPlayerWrapper = document.createElement('div')
  listPlayerWrapper.classList.add('info-player')
  if (online) {
    listPlayerWrapper.innerHTML = `
    <div class="name">${player.owner}</div>
    
    <div type="button" data-toggle="modal" data-target="#myModal" class="btn-invite" id="${player.id}">Invite</div>
    <div class="modal" id="myModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title" style="color: black;">Type Of Games</h4>
            <div type="button" class="close" data-dismiss="modal">&times;</div>
          </div>

          <div class="modal-body">
            <div class="dropdown-item" id="opt3x3" data-dismiss="modal">3x3</div>
            <div class="dropdown-item" id="opt5x5" data-dismiss="modal">5x5</div>
            <div class="dropdown-item" id="opt10x10" data-dismiss="modal">10x10</div>
          </div>

          <div class="modal-footer">
            <div type="button" class="btn btn-danger" data-dismiss="modal">Close</div>
          </div>
        </div>
      </div>
    </div>
    `
  } else {
    listPlayerWrapper.innerHTML = `
    <div class="name" >${player.owner}</div>
    <div id="${player.id}">Offline</div>
    `
  }
  document.querySelector('.aside-right .playerList').appendChild(listPlayerWrapper)

  document.getElementById(player.id).addEventListener('click', async () => {
    let inviteMesage = {
      createdAt: new Date().toISOString(),
      message: model.currentUser.displayName + " invited"
    }
    const typeElement = document.querySelectorAll('.modal .modal-dialog .modal-content .modal-body .dropdown-item')
    await typeElement.forEach(async type => {
      await type.addEventListener('click', handleClick)

    })


    function handleClick(e) {
      const type = e.target;
      inviteMesage.type = type.innerText
      model.invitationsPlayer(inviteMesage, player.id, player.email)
      if (inviteMesage.type === "3x3") {
        game.rule = 3;
        game.size = 3;
        view.setActiveScreen("playPage");
      } else if (inviteMesage.type === "5x5") {
        game.rule = 5;
        game.size = 5;
        view.setActiveScreen("playPage");
      } else if (inviteMesage.type === "10x10") {
        game.rule = 10;
        game.size = 10;
        view.setActiveScreen("playPage");
      }
    }


  })


}
view.addNotification = (message) => {
  let notification = document.createElement('button')
  notification.classList.add('dropdown-item')
  notification.innerText = message
  document.getElementById('listNotification').appendChild(notification)
}