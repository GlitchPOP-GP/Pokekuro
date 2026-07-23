import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import FittingScreen from "../screens/Fitting";
import CameraScreen from "../screens/Camera";
import ShopScreen from "../screens/Shop";
import ProfileScreen from "../screens/Profile";

import Footer from "../components/Footer";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <Footer {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Fitting" component={FittingScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}