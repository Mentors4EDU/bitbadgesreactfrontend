import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import { Checkbox, Paper, IconButton, Button } from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import * as S from "./styles";
import axios from "axios";

const deleteBadgeAd = async (event) => {
  console.log(event);

  initLogin(2, true)
    .then(async (e) => {
      for (let x in e) {
        window.localStorage.setItem(x, e[x]);
      }
      const url = `https://us-central1-bitbadges.cloudfunctions.net/api/badgePages/${event.target.value}`;
      let success = false;
      await axios
        .delete(url, {
          data: {
            publickey: window.localStorage.getItem("publicKey"),
            jwt: window.localStorage.getItem("jwt"),
          },
        })
        .then((res) => {
          console.log(res);
          success = true;
          window.location.reload();
        })
        .catch((err) => {
          success = false;
          alert(`Error: ${err}`);
        });
    })
    .catch((err) => {
      console.log(err);
      document.getElementById("issue-submitad").innerText = "";
    });
};
function initLogin(accessLevel, JWT) {
  return new Promise(function (resolve, reject) {
    function login() {
      identityWindow = window.open(
        "https://identity.bitclout.com/log-in?accessLevelRequest=" +
          accessLevel,
        null,
        "toolbar=no, width=800, height=1000, top=0, left=0"
      );
    }

    function handleInit(e) {
      if (!init) {
        init = true;

        for (const e of pendingRequests) {
          e.source.postMessage(e, "*");
        }

        pendingRequests = [];
        pm_id = e.data.id;
        source = e.source;
      }
      respond(e.source, e.data.id, {});
    }

    function handleLogin(payload) {
      user = payload["users"][payload.publicKeyAdded];
      user["publicKey"] = payload.publicKeyAdded;
      if (identityWindow) {
        if (JWT === false) {
          identityWindow.close();
          identityWindow = null;
          resolve(user);
        } else {
          var payload = {
            accessLevel: user.accessLevel,
            accessLevelHmac: user.accessLevelHmac,
            encryptedSeedHex: user.encryptedSeedHex,
          };
          source.postMessage(
            {
              id: pm_id,
              service: "identity",
              method: "jwt",
              payload: payload,
            },
            "*"
          );
        }
      }
    }

    function handleJWT(payload) {
      user["jwt"] = payload["jwt"];
      if (identityWindow) {
        identityWindow.close();
        identityWindow = null;
      }
      resolve(user);
    }

    function respond(e, t, n) {
      e.postMessage(
        {
          id: t,
          service: "identity",
        },
        "*"
      );
    }

    window.addEventListener("message", (message) => {
      const {
        data: { id: id, method: method, service: service, payload: payload },
      } = message;
      if (service !== "identity") {
        return;
      }

      if (method == "initialize") {
        handleInit(message);
      } else if (method == "login") {
        handleLogin(payload);
      } else if ("jwt" in payload) {
        handleJWT(payload);
      }
    });

    var init = false;
    var pm_id = "";
    var source = null;
    var user = null;
    var pendingRequests = [];
    var identityWindow = null;
    login();
  });
}

class HashList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      titles: new Map(),
    };

    this.getTitles = this.getTitles.bind(this);
    this.getTitles(this.props.hashArray);
  }

  async getTitles(badgesCreated) {
    badgesCreated.forEach(async (element) => {
      let url = `https://us-central1-bitbadges.cloudfunctions.net/api/badgePages/${element}`;
      let title = "";
      await axios
        .get(url)
        .then((response) => {
          console.log(response);
          title = response.data.title;
          let currState = this.state.titles;
          currState.set(element, title);
          this.setState({
            titles: currState,
          });
        })
        .catch((err) => {
          console.log("ERROR", err);
        });
      console.log(title);
    });

    console.log(this.state.titles);
  }
  render() {
    console.log("test");
    return (
      <>
        <S.Container>
          <Paper>
            <h5 align="center">{this.props.title}</h5>

            <List>
              {this.props.hashArray.length === 0 ? (
                <>
                  <p align="center">You haven't created any ads yet.</p>
                </>
              ) : (
                <p></p>
              )}
              {this.props.hashArray.map((value) => {
                const labelId = `checkbox-list-label-${value}`;

                return (
                  <ListItem key={value} role={undefined}>
                    <ListItemText
                      id={labelId}
                      primary={`${this.state.titles.get(value)}`}
                    />
                    <button value={value} onClick={deleteBadgeAd}>
                      Delete
                    </button>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </S.Container>
      </>
    );
  }
}

export default HashList;
