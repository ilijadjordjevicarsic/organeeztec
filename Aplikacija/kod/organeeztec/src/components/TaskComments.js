import { View, Pressable, Image, FlatList, TextInput } from "react-native";

import { Text } from "@react-native-material/core";
import { colorTheme } from "../styles/color_constants";
import { taskCommentsThem, taskCommentsMe } from "../styles/taskComments-style";
import { getTaskComments, addTaskComment } from "../firebase_functions";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { useEffect } from "react";

// export const TaskComments = ({id, navigation, user}) => {
export const TaskComments = (props) => {
  const [comments, setComments] = useState([]);
  const [update, forceUpdate] = useState(false);
  const [id, setId] = useState(null);
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const getComments = (param) => {
    getTaskComments(param)
      .then((res) => {
        res.sort((a, b) => a.date.toDate() - b.date.toDate());
        res[0].previous = "";
        for (let i = 1; i < res.length; i++) {
          res[i].previous = res[i - 1].user_id;
        }
        res.forEach((item) => {
          item.image = item.previous == "" || item.previous != item.user_id;
        });

        setComments(res);
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const newComment = (temp) => {
    addTaskComment(id, props.user.user_id, temp);
    let date = Timestamp.fromDate(new Date());
    let array = [
      ...comments,
      {
        user_id: props.user.user_id,
        user: props.user.name + " " + props.user.surname,
        picture: props.user.profile_pic_uri,
        message: temp,
        date: date,
      },
    ];
    if (comments.length != 0) {
      array[comments.length].previous = array[comments.length - 1].user_id;
      array[comments.length].image =
        array[comments.length].previous == "" ||
        array[comments.length].previous != array[comments.length].user_id;
    } else {
      array[array.length - 1].previous = "";
    }
    setComments(array);
  };

  useEffect(() => {
    if (props.route && props.route.params && props.route.params.id) {
      setId(props.route.params.id);
      getComments(props.route.params.id);
    } else {
      const id = "1.6.2023-19:47:39-FR";
      setId(id);
      getComments(id);
    }
  }, [update]);

  return (
    <View style={taskCommentsThem.container}>
      <FlatList
        style={taskCommentsThem.flatListContainer}
        contentContainerStyle={taskCommentsThem.flatListContentContainer}
        data={comments}
        initialScrollIndex={comments.length - 1}
        getItemLayout={(data, index) => ({
          length: 150,
          offset: 150 * index,
          index,
        })}
        renderItem={({ item }) => {
          return (
            <View
              style={[
                item.user_id != props.user.user_id &&
                  taskCommentsThem.commentContainer,
                item.user_id == props.user.user_id &&
                  taskCommentsMe.commentContainer,
                !item.image && { marginTop: 0 },
              ]}
            >
              {/* Slika */}
              {item.user_id != props.user.user_id && (
                <View
                  style={[
                    taskCommentsThem.imageContainer,
                    !item.image && { opacity: 0 },
                  ]}
                >
                  <Image
                    source={{ uri: item.picture }}
                    style={taskCommentsThem.image}
                  />
                </View>
              )}
              {/* Ostatak komentara - container */}
              <View
                style={[
                  item.user_id != props.user.user_id &&
                    taskCommentsThem.comment,
                  item.user_id == props.user.user_id && taskCommentsMe.comment,
                ]}
              >
                {/* Deo komentara / poruka i header */}
                <View
                  style={[
                    item.user_id != props.user.user_id && taskCommentsThem.left,
                    item.user_id == props.user.user_id && taskCommentsMe.left,
                  ]}
                >
                  {item.user_id != props.user.user_id && item.image && (
                    <View style={taskCommentsThem.headerWithDate}>
                      <View style={taskCommentsThem.header}>
                        <Text style={taskCommentsThem.name}>{item.user}</Text>
                        <Text style={taskCommentsThem.date}>
                          {item.date.toDate().getDate() +
                            "." +
                            (item.date.toDate().getMonth() + 1) +
                            "." +
                            item.date.toDate().getFullYear()}
                        </Text>
                      </View>
                    </View>
                  )}
                  <View
                    style={[
                      item.user_id != props.user.user_id &&
                        taskCommentsThem.messageContainer,
                      item.user_id == props.user.user_id &&
                        taskCommentsMe.messageContainer,
                    ]}
                  >
                    <Text
                      style={[
                        item.user_id != props.user.user_id &&
                          taskCommentsThem.message,
                        item.user_id == props.user.user_id &&
                          taskCommentsMe.message,
                      ]}
                    >
                      {item.message}
                    </Text>
                  </View>
                </View>
                {/* Samo vreme */}
                <View style={taskCommentsThem.timeContainer}>
                  <Text style={taskCommentsThem.time}>
                    {(item.date.toDate().getHours() < 10 ? "0" : "") +
                      item.date.toDate().getHours() +
                      ":" +
                      (item.date.toDate().getMinutes() < 10 ? "0" : "") +
                      item.date.toDate().getMinutes()}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      ></FlatList>
      <View
        style={[
          taskCommentsThem.inputContainer,
          inputFocused && { marginBottom: 15 },
        ]}
      >
        <TextInput
          style={taskCommentsThem.commentInput}
          multiline={true}
          value={input}
          autoCorrect={false}
          onChangeText={(input) => {
            setInput(input);
          }}
          onBlur={() => {
            setInputFocused(false);
          }}
          onFocus={() => {
            setInputFocused(true);
          }}
        />
        <Pressable
          style={[
            taskCommentsThem.icon,
            input &&
              input != "" && {
                backgroundColor: colorTheme.primary_color + "aa",
                borderColor: colorTheme.secondary_color,
              },
          ]}
          onPress={() => {
            input != "" && input && newComment(input);
            setInput("");
          }}
        >
          {((!input || input == "") && (
            <Feather name="send" size={24} color="black" />
          )) || <Feather name="send" size={24} color="white" />}
        </Pressable>
      </View>
    </View>
  );
};
