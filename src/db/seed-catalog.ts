import { createCatalog } from "@/lib/catalog-browsing";

import type { AppDb } from "./client";

type L = { en_US: string; ja_JP: string; zh_CN: string };
const LOCALES = ["en_US", "ja_JP", "zh_CN"] as const;

type SeedItem = { id: string; attr1: L; listPrice: number; unitCost: number };
type SeedProduct = { id: string; name: L; description: L; items: SeedItem[] };
type SeedCategory = { id: string; name: L; description: L; products: SeedProduct[] };

const l = (en_US: string, ja_JP: string, zh_CN: string): L => ({ en_US, ja_JP, zh_CN });

const SAMPLE: SeedCategory[] = [
  {
    id: "FISH",
    name: l("Fish", "魚", "鱼"),
    description: l("Salt water and fresh water fish.", "海水魚と淡水魚。", "海水鱼和淡水鱼。"),
    products: [
      {
        id: "FI-SW-01",
        name: l("Angelfish", "エンゼルフィッシュ", "神仙鱼"),
        description: l(
          "Salt water fish from Australia.",
          "オーストラリア産の海水魚。",
          "来自澳大利亚的海水鱼。",
        ),
        items: [
          { id: "EST-1", attr1: l("Large", "大", "大"), listPrice: 16.5, unitCost: 10 },
          { id: "EST-2", attr1: l("Small", "小", "小"), listPrice: 16.5, unitCost: 10 },
        ],
      },
      {
        id: "FI-FW-02",
        name: l("Goldfish", "金魚", "金鱼"),
        description: l("Fresh water fish from China.", "中国産の淡水魚。", "来自中国的淡水鱼。"),
        items: [
          { id: "EST-3", attr1: l("Spotted", "まだら", "斑点"), listPrice: 6.5, unitCost: 3 },
        ],
      },
    ],
  },
  {
    id: "DOGS",
    name: l("Dogs", "犬", "狗"),
    description: l("Loyal dogs of every size.", "あらゆる大きさの忠実な犬。", "各种体型的忠诚犬。"),
    products: [
      {
        id: "K9-BD-01",
        name: l("Bulldog", "ブルドッグ", "斗牛犬"),
        description: l(
          "Friendly dog from England.",
          "イギリス原産の人懐こい犬。",
          "来自英国的友好犬种。",
        ),
        items: [
          {
            id: "EST-6",
            attr1: l("Male Adult", "成犬オス", "成年雄性"),
            listPrice: 18.5,
            unitCost: 12,
          },
        ],
      },
      {
        id: "K9-PO-02",
        name: l("Poodle", "プードル", "贵宾犬"),
        description: l(
          "Cute dog from France.",
          "フランス原産のかわいい犬。",
          "来自法国的可爱犬种。",
        ),
        items: [
          {
            id: "EST-8",
            attr1: l("Male Puppy", "子犬オス", "雄性幼犬"),
            listPrice: 18.5,
            unitCost: 12,
          },
        ],
      },
    ],
  },
  {
    id: "CATS",
    name: l("Cats", "猫", "猫"),
    description: l(
      "Kittens and adult cats, from Manx to Persian.",
      "マンクスからペルシャまで、子猫と成猫。",
      "从曼克斯猫到波斯猫的幼猫和成猫。",
    ),
    products: [
      {
        id: "FL-DSH-01",
        name: l("Manx", "マンクス", "曼克斯猫"),
        description: l(
          "Great for reducing mouse populations.",
          "ネズミ退治に最適。",
          "非常适合捕鼠。",
        ),
        items: [
          { id: "EST-14", attr1: l("Tailless", "尾なし", "无尾"), listPrice: 58.5, unitCost: 40 },
        ],
      },
      {
        id: "FL-DLH-02",
        name: l("Persian", "ペルシャ", "波斯猫"),
        description: l(
          "Friendly house cat, great with children.",
          "子供好きの飼い猫。",
          "对孩子友好的家猫。",
        ),
        items: [
          {
            id: "EST-16",
            attr1: l("Adult Female", "成猫メス", "成年雌性"),
            listPrice: 93.5,
            unitCost: 60,
          },
        ],
      },
    ],
  },
  {
    id: "REPTILES",
    name: l("Reptiles", "爬虫類", "爬行动物"),
    description: l("Snakes, lizards and more.", "ヘビ、トカゲなど。", "蛇、蜥蜴等。"),
    products: [
      {
        id: "RP-SN-01",
        name: l("Rattlesnake", "ガラガラヘビ", "响尾蛇"),
        description: l("Doubles as a watch dog.", "番犬代わりにもなる。", "可兼作看门犬。"),
        // Priced below cost on purpose: the catalog does not constrain it (R-0162).
        items: [
          { id: "EST-11", attr1: l("Venomless", "無毒", "无毒"), listPrice: 18.5, unitCost: 20 },
        ],
      },
      {
        id: "RP-LI-02",
        name: l("Iguana", "イグアナ", "鬣蜥"),
        description: l("Friendly green friend.", "人懐こい緑の友達。", "友好的绿色伙伴。"),
        items: [
          {
            id: "EST-13",
            attr1: l("Green Adult", "緑の成体", "绿色成年"),
            listPrice: 18.5,
            unitCost: 12,
          },
        ],
      },
    ],
  },
  {
    id: "BIRDS",
    name: l("Birds", "鳥", "鸟"),
    description: l(
      "Parrots, finches and other feathered friends.",
      "オウム、フィンチなどの鳥たち。",
      "鹦鹉、雀类和其他羽毛朋友。",
    ),
    products: [
      {
        id: "AV-CB-01",
        name: l("Amazon Parrot", "アマゾンオウム", "亚马逊鹦鹉"),
        description: l(
          "Great companion for up to 75 years.",
          "75年も付き合える相棒。",
          "长达75年的好伙伴。",
        ),
        items: [
          {
            id: "EST-18",
            attr1: l("Adult Male", "成鳥オス", "成年雄性"),
            listPrice: 193.5,
            unitCost: 120,
          },
        ],
      },
      {
        id: "AV-SB-02",
        name: l("Finch", "フィンチ", "雀"),
        description: l("Great stress reliever.", "ストレス解消に最適。", "极佳的减压伙伴。"),
        items: [
          {
            id: "EST-19",
            attr1: l("Adult Male", "成鳥オス", "成年雄性"),
            listPrice: 15.5,
            unitCost: 8,
          },
        ],
      },
    ],
  },
];

const text = (name: L, description: L) =>
  Object.fromEntries(LOCALES.map((k) => [k, { name: name[k], description: description[k] }]));

/** Insert the sample catalog (five categories, ten products, eleven items) in three locales. */
export async function seedCatalog(db: AppDb): Promise<void> {
  const catalog = createCatalog({ db });
  for (const c of SAMPLE) {
    await catalog.addCategory({ id: c.id, details: text(c.name, c.description) });
    for (const p of c.products) {
      await catalog.addProduct({
        id: p.id,
        categoryId: c.id,
        details: text(p.name, p.description),
      });
      for (const i of p.items) {
        await catalog.addItem({
          id: i.id,
          productId: p.id,
          details: Object.fromEntries(
            LOCALES.map((k) => [
              k,
              {
                listPrice: i.listPrice,
                unitCost: i.unitCost,
                image: `${i.id.toLowerCase()}.gif`,
                description: p.description[k],
                attr1: i.attr1[k],
              },
            ]),
          ),
        });
      }
    }
  }
}
