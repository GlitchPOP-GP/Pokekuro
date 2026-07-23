import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { itemAddStyles } from "../styles/screens/itemAdd";
import { useItemAdd } from "../hooks/useItemAdd";
import Dropdown from "../components/Dropdown";
import TagManager from "../components/TagManager";
import ShopRegister from "../components/ShopRegister";
import MockTabBar from "../components/MockTabBar";
import GlobalStyles from "../components/Background";
import FittingProgressOverlay from "../components/FittingProgressOverlay";

type Props = NativeStackScreenProps<RootStackParamList, "ItemAdd">;

export default function ItemAdd({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();

  const {
    previewImage,
    selectedSeason,
    selectedCategory,
    tags,
    shopName,
    setShopName,
    registeringShop,
    isSeasonModalOpen,
    setIsSeasonModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    submitting,
    fittingStatus,
    fittingPhase,
    fittingError,
    pendingApprovalGeminiImageUrl,
    approving,
    handleApproveGeminiImage,
    seasons,
    categories,
    handleSelectSeason,
    handleSelectCategory,
    handleAddTag,
    handleRemoveTag,
    handleRegisterShop,
    handleConfirm,
    handleSkipFitting,
  } = useItemAdd({
    onConfirmSuccess: () => {
      (navigation as any).navigate("MainTabs", {
        screen: "Fitting",
      });
    },
  });

  return (
    <GlobalStyles>
      <View style={[itemAddStyles.overlay, { paddingTop: insets.top }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={itemAddStyles.scrollContent}
        >
          {/* 画像表示エリア */}
          <View style={itemAddStyles.imageCard}>
            <Image
              source={previewImage}
              style={itemAddStyles.previewImage}
              resizeMode="cover"
            />
          </View>

          {/* 入力フォーム */}
          <View style={itemAddStyles.formContainer}>
            {/* 上下カテゴリの選択 */}
            <Dropdown
              placeholder="上下を選択"
              selectedValue={selectedCategory}
              isOpen={isCategoryModalOpen}
              setIsOpen={setIsCategoryModalOpen}
              options={categories}
              onSelect={handleSelectCategory}
            />

            {/* 季節感の選択 */}
            <Dropdown
              placeholder="季節感を選択"
              selectedValue={selectedSeason}
              isOpen={isSeasonModalOpen}
              setIsOpen={setIsSeasonModalOpen}
              options={seasons}
              onSelect={handleSelectSeason}
            />

            {/* タグ管理 */}
            <TagManager
              tags={tags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />

            {/* 店舗登録 */}
            <ShopRegister
              value={shopName}
              onChangeText={setShopName}
              onRegisterShop={handleRegisterShop}
              registering={registeringShop}
            />

            {/* 確定ボタン */}
            <TouchableOpacity
              style={itemAddStyles.confirmButton}
              activeOpacity={0.8}
              onPress={handleConfirm}
              disabled={submitting}
            >
              <Text style={itemAddStyles.confirmButtonText}>
                {submitting ? "アップロード中..." : "確定"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* 画面最下部のタブバー (モック) */}
      <MockTabBar navigation={navigation} />

      {/* 3D生成の進捗オーバーレイ */}
      <FittingProgressOverlay
        status={fittingStatus}
        error={fittingError}
        onSkip={handleSkipFitting}
        onContinue={handleSkipFitting}
        geminiImageUrl={pendingApprovalGeminiImageUrl}
        approving={approving}
        onApprove={handleApproveGeminiImage}
        phase={fittingPhase}
      />
    </GlobalStyles>
  );
}
