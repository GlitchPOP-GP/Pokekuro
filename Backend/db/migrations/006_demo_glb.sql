-- 006_demo_glb.sql — デモ用のフィット済み GLB をシードアイテムに紐付ける。
--
-- GLB の実体は Backend/public/models/brown_jacket.glb。
-- models/ は bind mount されないので api イメージに焼き込まれる。
-- そのため、イメージだけ受け取った側でも（リポジトリのファイルが無くても）
-- 起動しただけで着せ替えを試せる。
-- ※ generated/ に置くと bind mount に覆われて見えなくなるので置かないこと。
--

UPDATE clothing_items
   SET glb_url = '/models/brown_jacket.glb'
 WHERE image = '/assets/brown_jacket.png';
