import { ActivityIndicator } from "@react-native-material/core";
import { colorTheme } from "../styles/color_constants";

export const LoadingIndicator = (props) => {
  return (
    <ActivityIndicator
      size="large"
      color={
        props.dark ? colorTheme.tertiary_color : colorTheme.light_primary_color
      }
      style={props.style}
    ></ActivityIndicator>
  );
};
