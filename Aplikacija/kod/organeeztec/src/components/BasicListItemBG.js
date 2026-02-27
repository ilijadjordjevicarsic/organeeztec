import { View, Text } from "react-native";
import { colorTheme } from "../styles/color_constants";
import { Pressable } from "react-native";

export const BasicListItemBG = (props) => {
  return (
    <Pressable
      onPress={() => {
        if (props.onPress != null) props.onPress();
      }}
    >
      <View
        style={{
          width: "100%",
          height: 150,
          padding: "2%",
          // these shadows work only for ios
          shadowColor: "#000",
          shadowOffset: { width: -0.5, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          ...props.cotainerStyle,
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 10,
            overflow: "hidden",
            borderColor: "#999",
            borderWidth: 0.5,
            backgroundColor: "#FFF",
            // Android shadow
            elevation: 10,
            ...props.cardStyle,
          }}
        >
          <View
            style={{
              flex: 1,
              alignSelf: "center",
              justifyContent: "center",
              padding: "2%",
              ...props.itemStyle,
            }}
          >
            {props.children}
          </View>
        </View>
      </View>
    </Pressable>
  );
};
