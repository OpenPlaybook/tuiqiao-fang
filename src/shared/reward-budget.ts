// 课程奖励的唯一上限配置。分配依据随题库评审，运行时不按题型猜测预算。
export const REWARD_BUDGET: Record<string, { stars: number; extensions: Record<string, number> }> = {
  "p1-fan": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "p1-piaomu": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p1-yifan": {
    "stars": 2,
    "extensions": {
      "x1": 5,
      "x2": 3,
      "x3": 5
    }
  },
  "p1-yifan3": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3,
      "x3": 5
    }
  },
  "p1-ruo": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p1-kan": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p1-bb": {
    "stars": 3,
    "extensions": {
      "x1": 8,
      "x2": 3,
      "x3": 3
    }
  },
  "p1-zy": {
    "stars": 3,
    "extensions": {
      "x1": 8,
      "x2": 3
    }
  },
  "p1-x-wusong": {
    "stars": 5,
    "extensions": {}
  },
  "p1-x-ji": {
    "stars": 5,
    "extensions": {}
  },
  "p1-x-zi": {
    "stars": 5,
    "extensions": {}
  },
  "dz-honghu": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "dz-deng": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "dz-dan": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "dz-huming": {
    "stars": 3,
    "extensions": {
      "x1": 8
    }
  },
  "dz-mis": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "dz-zhong": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "dz-jiegan": {
    "stars": 2,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "dz-jiegan3": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "dz-x-siguo": {
    "stars": 8,
    "extensions": {}
  },
  "lb1-zhangfu": {
    "stars": 5,
    "extensions": {
      "x1": 8
    }
  },
  "lb1-dai": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "lb1-dayan": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "lb1-x-juechang": {
    "stars": 5,
    "extensions": {}
  },
  "lb1-x-zhangfu": {
    "stars": 5,
    "extensions": {}
  },
  "lb1-x-gujin": {
    "stars": 5,
    "extensions": {}
  },
  "lb1-x-pian": {
    "stars": 5,
    "extensions": {}
  },
  "xy1-wanren": {
    "stars": 5,
    "extensions": {
      "x1": 8
    }
  },
  "xy1-jing": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xy1-zu": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xy1-x-kangding": {
    "stars": 5,
    "extensions": {}
  },
  "xy1-x-fenshu": {
    "stars": 5,
    "extensions": {}
  },
  "xy1-x-zi": {
    "stars": 5,
    "extensions": {}
  },
  "xh1-zuoyou": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xh1-du": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xh1-gu": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xh1-x-jiuzhang": {
    "stars": 5,
    "extensions": {}
  },
  "xh1-x-yi": {
    "stars": 5,
    "extensions": {}
  },
  "zl1-ju": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl1-wu": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "zl1-geng": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl1-x-libai": {
    "stars": 5,
    "extensions": {}
  },
  "zl1-x-zixu": {
    "stars": 5,
    "extensions": {}
  },
  "zl1-x-gu": {
    "stars": 5,
    "extensions": {}
  },
  "zl2-e": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl2-lv": {
    "stars": 3,
    "extensions": {
      "x1": 8
    }
  },
  "zl2-qi": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl2-x-huangshi": {
    "stars": 5,
    "extensions": {}
  },
  "zl2-x-ren": {
    "stars": 5,
    "extensions": {}
  },
  "zl2-x-yishang": {
    "stars": 5,
    "extensions": {}
  },
  "lb2-du": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "lb2-ku": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "lb2-ai": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "lb2-x-she": {
    "stars": 5,
    "extensions": {}
  },
  "lb3-nue": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "lb3-ni": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "lb3-yue": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "lb3-x-guoqin": {
    "stars": 5,
    "extensions": {}
  },
  "lb3-x-yuefa": {
    "stars": 5,
    "extensions": {}
  },
  "xy2-fu": {
    "stars": 2,
    "extensions": {
      "x1": 8
    }
  },
  "xy2-dang": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xy2-xi": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xy2-x-gaohui": {
    "stars": 5,
    "extensions": {}
  },
  "xy2-x-ao": {
    "stars": 5,
    "extensions": {}
  },
  "zl3-xing": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl3-dai": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl3-x-yushui": {
    "stars": 5,
    "extensions": {}
  },
  "zl3-x-lue": {
    "stars": 5,
    "extensions": {}
  },
  "xh2-du": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xh2-ju": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xh2-x-tuqiong": {
    "stars": 5,
    "extensions": {}
  },
  "xh2-x-shou": {
    "stars": 5,
    "extensions": {}
  },
  "xh2-x-tushu": {
    "stars": 5,
    "extensions": {}
  },
  "xy3-du": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xy3-yi": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "xy3-hou": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xy3-x-efang": {
    "stars": 5,
    "extensions": {}
  },
  "xy3-x-zhoujin": {
    "stars": 5,
    "extensions": {}
  },
  "xy3-x-wang": {
    "stars": 5,
    "extensions": {}
  },
  "xy3-x-nu": {
    "stars": 5,
    "extensions": {}
  },
  "zl4-yi": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl4-shi": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl4-chen": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl4-x-mingxiu": {
    "stars": 5,
    "extensions": {}
  },
  "zl4-x-xian": {
    "stars": 5,
    "extensions": {}
  },
  "lb4-gao": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "lb4-dui": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "lb4-x-shilu": {
    "stars": 5,
    "extensions": {}
  },
  "lb4-x-bing": {
    "stars": 5,
    "extensions": {}
  },
  "xy4-chen": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "xy4-wei": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xy4-x-tian": {
    "stars": 5,
    "extensions": {}
  },
  "xy4-x-bing": {
    "stars": 8,
    "extensions": {}
  },
  "xy4-x-duan": {
    "stars": 12,
    "extensions": {}
  },
  "xh3-bian": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xh3-ji": {
    "stars": 3,
    "extensions": {
      "x1": 8
    }
  },
  "xh3-sheng": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xh3-x-zushi": {
    "stars": 5,
    "extensions": {}
  },
  "xh3-x-bing": {
    "stars": 5,
    "extensions": {
      "x1": 3,
      "x2": 3
    }
  },
  "zl5-zhu": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "zl5-ba": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "zl5-shu": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl5-x-tubu": {
    "stars": 5,
    "extensions": {}
  },
  "zl5-x-bing": {
    "stars": 5,
    "extensions": {}
  },
  "lb5-zu": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "lb5-weng": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "lb5-zhi": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "lb5-x-geng": {
    "stars": 5,
    "extensions": {}
  },
  "lb5-x-huan": {
    "stars": 5,
    "extensions": {}
  },
  "zl6-hong": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "zl6-yi": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl6-x-qiongkou": {
    "stars": 5,
    "extensions": {}
  },
  "hx4-jia": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "hx4-nie": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "hx4-he": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "hx4-x-nie": {
    "stars": 5,
    "extensions": {}
  },
  "hx4-x-duan": {
    "stars": 12,
    "extensions": {}
  },
  "sj-man": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "sj-li": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "sj-yi": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "sj-chou": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "sj-kui": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "sj-jie": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "sj-qin": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "sj-hai": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "sj-jin": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "sj-x-zi": {
    "stars": 5,
    "extensions": {}
  },
  "lb6-ge": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "lb6-kai": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "lb6-x-liangge": {
    "stars": 5,
    "extensions": {}
  },
  "lb6-x-ku": {
    "stars": 5,
    "extensions": {}
  },
  "xh4-han": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xh4-gou": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "xh4-x-gong": {
    "stars": 5,
    "extensions": {}
  },
  "zl7-liu": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl7-qi": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "zl7-x-fuyi": {
    "stars": 5,
    "extensions": {}
  },
  "zl7-x-ai": {
    "stars": 5,
    "extensions": {}
  },
  "xh5-hen": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xh5-shu": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "xh5-hua": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "xh5-x-jiechao": {
    "stars": 5,
    "extensions": {}
  },
  "xh5-x-xiaocao": {
    "stars": 5,
    "extensions": {}
  },
  "xh5-x-long": {
    "stars": 12,
    "extensions": {}
  },
  "p2-wuwen": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "p2-mis": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "p2-shuo": {
    "stars": 3,
    "extensions": {
      "x1": 8,
      "x2": 5
    }
  },
  "p2-ting": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p2-dp": {
    "stars": 5,
    "extensions": {
      "x1": 8,
      "x2": 3
    }
  },
  "p2-x-gan": {
    "stars": 5,
    "extensions": {}
  },
  "p2-x-yan": {
    "stars": 12,
    "extensions": {}
  },
  "p3-zuo": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "p3-mis": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p3-xz": {
    "stars": 2,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p3-xz3": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p3-fk": {
    "stars": 3,
    "extensions": {
      "x1": 8,
      "x2": 3
    }
  },
  "p3-yurou": {
    "stars": 5,
    "extensions": {
      "x1": 3,
      "x2": 5
    }
  },
  "p3-shuzi": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p3-bing": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "p3-x-hu": {
    "stars": 5,
    "extensions": {}
  },
  "p3-x-ci": {
    "stars": 5,
    "extensions": {}
  },
  "p4-tg": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p4-qi": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "p4-mis": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p4-gs": {
    "stars": 2,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p4-gs3": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p4-fu": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p4-cc": {
    "stars": 2,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p4-fd": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "p4-x-cy": {
    "stars": 5,
    "extensions": {}
  },
  "p5-zhen": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "p5-xiao": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p5-mis": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "p5-od": {
    "stars": 8,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p5-bs": {
    "stars": 2,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p5-bs3": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p5-shi": {
    "stars": 5,
    "extensions": {
      "x1": 3
    }
  },
  "p5-ql": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "p5-dj": {
    "stars": 5,
    "extensions": {
      "x1": 8
    }
  },
  "p5-x-xiao": {
    "stars": 5,
    "extensions": {}
  },
  "p6-bi": {
    "stars": 3,
    "extensions": {
      "x1": 3
    }
  },
  "p6-chuge": {
    "stars": 2,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "p6-kangkai": {
    "stars": 5,
    "extensions": {
      "x1": 3,
      "x2": 3
    }
  },
  "p6-gexin": {
    "stars": 5,
    "extensions": {
      "x1": 3,
      "x2": 3
    }
  },
  "p6-beizhuang": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p6-wujiang": {
    "stars": 12,
    "extensions": {
      "x1": 3,
      "x2": 3
    }
  },
  "p6-sanshi": {
    "stars": 8,
    "extensions": {
      "x1": 3,
      "x2": 3,
      "x3": 2
    }
  },
  "p6-gao": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p6-gaikuo": {
    "stars": 8,
    "extensions": {
      "x1": 2
    }
  },
  "p6-x-gou": {
    "stars": 5,
    "extensions": {}
  },
  "p7-ren": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "p7-zz": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p7-niao": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "p7-niao3": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "p7-jiang": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p7-xiao": {
    "stars": 2,
    "extensions": {
      "x1": 3,
      "x2": 3
    }
  },
  "p7-fa": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "p7-zy": {
    "stars": 5,
    "extensions": {
      "x1": 8
    }
  },
  "p7-x-kua": {
    "stars": 5,
    "extensions": {}
  },
  "p7-x-tu": {
    "stars": 8,
    "extensions": {}
  },
  "p7-x-yi": {
    "stars": 5,
    "extensions": {}
  },
  "e1-nervous": {
    "stars": 2,
    "extensions": {
      "x1": 8
    }
  },
  "e1-notice": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "e1-clueword": {
    "stars": 2,
    "extensions": {
      "x1": 3
    }
  },
  "e1-mis": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "e1-taken": {
    "stars": 3,
    "extensions": {
      "x1": 12,
      "x2": 3
    }
  },
  "e1-taken3": {
    "stars": 5,
    "extensions": {
      "x1": 12,
      "x2": 3
    }
  },
  "e1-eating": {
    "stars": 3,
    "extensions": {
      "x1": 8,
      "x2": 3
    }
  },
  "e1-borrow": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "e1-borrow1": {
    "stars": 2,
    "extensions": {
      "x1": 5,
      "x2": 5
    }
  },
  "e1-polite": {
    "stars": 2,
    "extensions": {
      "x1": 8,
      "x2": 3
    }
  },
  "e1-watch": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "e1-lent": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "e1-clue": {
    "stars": 5,
    "extensions": {
      "x1": 5
    }
  },
  "e1-order": {
    "stars": 3,
    "extensions": {
      "x1": 3
    }
  },
  "e1-x-final": {
    "stars": 5,
    "extensions": {}
  },
  "e1-x-lose": {
    "stars": 5,
    "extensions": {}
  },
  "e2-suspect": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "e2-look": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "e2-say": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "e2-mean": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "e2-ask": {
    "stars": 2,
    "extensions": {
      "x1": 3,
      "x2": 3
    }
  },
  "e2-when": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 3
    }
  },
  "e2-was": {
    "stars": 2,
    "extensions": {
      "x1": 3,
      "x2": 2
    }
  },
  "e2-while": {
    "stars": 5,
    "extensions": {
      "x1": 3,
      "x2": 2
    }
  },
  "e2-mia": {
    "stars": 3,
    "extensions": {
      "x1": 5,
      "x2": 2
    }
  },
  "e2-alibi": {
    "stars": 8,
    "extensions": {
      "x1": 3
    }
  },
  "e2-write": {
    "stars": 5,
    "extensions": {
      "x1": 2
    }
  },
  "e2-x-make": {
    "stars": 5,
    "extensions": {}
  },
  "e3-mix": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "e3-proof": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "e3-guess": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "e3-find": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "e3-green": {
    "stars": 2,
    "extensions": {
      "x1": 3
    }
  },
  "e3-meant": {
    "stars": 5,
    "extensions": {
      "x1": 5,
      "x2": 2
    }
  },
  "e3-compare": {
    "stars": 5,
    "extensions": {
      "x1": 3
    }
  },
  "e3-must": {
    "stars": 5,
    "extensions": {
      "x1": 3,
      "x2": 3
    }
  },
  "e3-write": {
    "stars": 8,
    "extensions": {
      "x1": 2
    }
  },
  "e3-x-bring": {
    "stars": 5,
    "extensions": {}
  },
  "e4-clearly": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "e4-fault": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "e4-intime": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "e4-review": {
    "stars": 5,
    "extensions": {
      "x2": 5,
      "x1": 8
    }
  },
  "e4-steal": {
    "stars": 2,
    "extensions": {
      "x1": 3
    }
  },
  "e4-ten": {
    "stars": 3,
    "extensions": {
      "x1": 3,
      "x2": 3
    }
  },
  "e4-order": {
    "stars": 8,
    "extensions": {
      "x1": 2
    }
  },
  "e4-too": {
    "stars": 3,
    "extensions": {
      "x1": 3,
      "x2": 3
    }
  },
  "e4-best": {
    "stars": 2,
    "extensions": {
      "x1": 5
    }
  },
  "e4-ever": {
    "stars": 3,
    "extensions": {
      "x1": 5
    }
  },
  "e4-write": {
    "stars": 8,
    "extensions": {
      "x1": 3
    }
  },
  "e4-x-red": {
    "stars": 5,
    "extensions": {}
  },
  "e4-x-rob": {
    "stars": 5,
    "extensions": {}
  },
  "e4-x-spot": {
    "stars": 8,
    "extensions": {}
  }
};
export const MAX_REWARD = Math.max(...Object.values(REWARD_BUDGET).flatMap(b=>[b.stars,...Object.values(b.extensions)]));
export function taskBudget(id: string) { const value=REWARD_BUDGET[id]; if(!value) throw Error(`缺少任务奖励：${id}`); return value.stars; }
export function extensionBudget(id: string, ext: string) { const value=REWARD_BUDGET[id]?.extensions[ext]; if(value===undefined) throw Error(`缺少拓展奖励：${id}/${ext}`); return value; }
export function earnedStars(max: number, quality: number) { if(!Number.isFinite(quality)||quality<0||quality>1) throw Error('无效的作答质量'); return Math.max(1,Math.round(max*quality)); }
export function extensionStars(id: string, ext: string, quality: number) { return quality>=0.6?earnedStars(extensionBudget(id,ext),quality):0; }
