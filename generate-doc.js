const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType } = require('docx');
const fs = require('fs');

// 定义边框样式
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

// 创建表格单元格的辅助函数
function createCell(text, options = {}) {
  const { bold = false, fill = null, width = 2000 } = options;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({
      children: [new TextRun({ text, bold, size: 21 })]
    })]
  });
}

// 创建表格行的辅助函数
function createRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((cell, i) => createCell(cell, { 
      bold: isHeader, 
      fill: isHeader ? "E8E8E8" : null,
      width: i === 0 ? 2500 : i === 1 ? 3500 : 3000
    }))
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Microsoft YaHei" },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Microsoft YaHei" },
        paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // 标题
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "项目门户功能清单", bold: true, size: 44 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "版本: v2.10    更新日期: 2026-03-26", size: 21, color: "666666" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "项目地址: https://songhonglu.github.io/projects/", size: 21, color: "0066CC" })]
      }),

      // 一、系统概述
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("一、系统概述")] }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("项目门户是一个基于 GitHub Pages 的纯前端单页应用，提供统一的项目入口、用户认证和权限管理功能。所有数据存储在浏览器 localStorage 中，支持多用户、多角色、多项目的访问控制。")]
      }),

      // 二、核心功能模块
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("二、核心功能模块")] }),
      
      // 2.1 用户认证模块
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 用户认证模块")] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [2500, 3500, 3000],
        rows: [
          createRow(["功能点", "说明", "权限"], true),
          createRow(["用户登录", "支持用户名/密码登录，密码使用 SHA-256 加密存储", "所有用户"]),
          createRow(["会话恢复", "刷新页面后自动恢复登录状态（sessionStorage）", "所有用户"]),
          createRow(["退出登录", "清除会话数据，返回登录页", "所有用户"]),
          createRow(["修改密码", "用户可自行修改密码（需验证原密码）", "所有用户"]),
        ]
      }),
      new Paragraph({
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({ text: "登录凭证: ", bold: true }),
          new TextRun("管理员: songhw / Seeyon@JD    普通用户: chenpt / 123456")
        ]
      }),

      // 2.2 用户管理模块
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 用户管理模块")] }),
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "管理员功能:", bold: true })] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [2500, 6500],
        rows: [
          new TableRow({
            children: [
              createCell("功能点", { bold: true, fill: "E8E8E8", width: 2500 }),
              createCell("说明", { bold: true, fill: "E8E8E8", width: 6500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("查看用户列表", { width: 2500 }),
              createCell("表格形式展示所有用户信息（用户名、角色、邮箱、手机、权限）", { width: 6500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("添加用户", { width: 2500 }),
              createCell("创建新用户，设置用户名、显示名、初始密码、角色", { width: 6500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("编辑用户", { width: 2500 }),
              createCell("修改用户显示名、邮箱、手机、项目权限", { width: 6500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("重置密码", { width: 2500 }),
              createCell("为其他用户重置密码", { width: 6500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("删除用户", { width: 2500 }),
              createCell("删除非管理员用户", { width: 6500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("权限管理", { width: 2500 }),
              createCell("为普通用户分配/取消项目访问权限", { width: 6500 }),
            ]
          }),
        ]
      }),

      // 2.3 项目管理模块
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("2.3 项目管理模块")] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [2500, 3500, 3000],
        rows: [
          createRow(["功能点", "说明", "权限"], true),
          createRow(["项目列表", "展示所有项目（根据用户权限过滤）", "所有用户"]),
          createRow(["卡片视图", "网格布局展示项目卡片", "所有用户"]),
          createRow(["列表视图", "紧凑列表展示项目信息", "所有用户"]),
          createRow(["表格视图", "详细表格展示项目属性", "所有用户"]),
          createRow(["访问项目", "点击按钮在新标签页打开项目", "有权限用户"]),
          createRow(["查看GitHub", "跳转到项目的 GitHub 仓库", "所有用户"]),
        ]
      }),

      // 当前项目列表
      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "当前项目列表:", bold: true })] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [2000, 3500, 1500, 2000],
        rows: [
          new TableRow({
            children: [
              createCell("项目ID", { bold: true, fill: "E8E8E8", width: 2000 }),
              createCell("项目名称", { bold: true, fill: "E8E8E8", width: 3500 }),
              createCell("状态", { bold: true, fill: "E8E8E8", width: 1500 }),
              createCell("默认访问控制", { bold: true, fill: "E8E8E8", width: 2000 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("contractmap", { width: 2000 }),
              createCell("合同数字化平台集成全景图", { width: 3500 }),
              createCell("已上线", { width: 1500 }),
              createCell("需认证", { width: 2000 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("huarongdao-game", { width: 2000 }),
              createCell("数字华容道", { width: 3500 }),
              createCell("已上线", { width: 1500 }),
              createCell("公开", { width: 2000 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("amberk", { width: 2000 }),
              createCell("Amberk", { width: 3500 }),
              createCell("未上线", { width: 1500 }),
              createCell("需认证", { width: 2000 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("number-huarongdao", { width: 2000 }),
              createCell("数字华容道（早期版本）", { width: 3500 }),
              createCell("未上线", { width: 1500 }),
              createCell("公开", { width: 2000 }),
            ]
          }),
        ]
      }),

      // 2.4 访问控制模块
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("2.4 访问控制模块")] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [2500, 3500, 3000],
        rows: [
          createRow(["功能点", "说明", "权限"], true),
          createRow(["项目访问控制", "开启/关闭项目的门户认证要求", "管理员"]),
          createRow(["用户项目授权", "为普通用户分配可访问的项目", "管理员"]),
          createRow(["跨项目认证", "通过 localStorage 传递 token 实现单点登录", "系统自动"]),
        ]
      }),

      // 2.5 主题切换模块
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("2.5 主题切换模块")] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [2500, 3500, 3000],
        rows: [
          createRow(["功能点", "说明", "适用场景"], true),
          createRow(["暗黑主题", "深色背景，适合夜间使用", "默认主题"]),
          createRow(["亮白主题", "浅色背景，适合白天使用", "护眼模式"]),
          createRow(["商务主题", "深蓝色调，专业正式", "商务演示"]),
        ]
      }),

      // 三、权限体系
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("三、权限体系")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 角色定义")] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [2000, 2000, 5000],
        rows: [
          new TableRow({
            children: [
              createCell("角色", { bold: true, fill: "E8E8E8", width: 2000 }),
              createCell("标识", { bold: true, fill: "E8E8E8", width: 2000 }),
              createCell("权限范围", { bold: true, fill: "E8E8E8", width: 5000 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("管理员", { width: 2000 }),
              createCell("admin", { width: 2000 }),
              createCell("所有功能", { width: 5000 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("普通用户", { width: 2000 }),
              createCell("user", { width: 2000 }),
              createCell("仅个人相关功能", { width: 5000 }),
            ]
          }),
        ]
      }),

      // 3.2 权限矩阵
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun("3.2 权限矩阵")] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [4000, 2500, 2500],
        rows: [
          new TableRow({
            children: [
              createCell("功能", { bold: true, fill: "E8E8E8", width: 4000 }),
              createCell("管理员", { bold: true, fill: "E8E8E8", width: 2500 }),
              createCell("普通用户", { bold: true, fill: "E8E8E8", width: 2500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("查看所有用户", { width: 4000 }),
              createCell("✅", { width: 2500 }),
              createCell("❌", { width: 2500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("添加/删除用户", { width: 4000 }),
              createCell("✅", { width: 2500 }),
              createCell("❌", { width: 2500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("编辑其他用户", { width: 4000 }),
              createCell("✅", { width: 2500 }),
              createCell("❌", { width: 2500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("重置他人密码", { width: 4000 }),
              createCell("✅", { width: 2500 }),
              createCell("❌", { width: 2500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("修改访问控制", { width: 4000 }),
              createCell("✅", { width: 2500 }),
              createCell("❌", { width: 2500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("查看个人信息", { width: 4000 }),
              createCell("✅", { width: 2500 }),
              createCell("✅", { width: 2500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("编辑自己的信息", { width: 4000 }),
              createCell("✅", { width: 2500 }),
              createCell("✅", { width: 2500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("修改自己的密码", { width: 4000 }),
              createCell("✅", { width: 2500 }),
              createCell("✅", { width: 2500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("查看项目列表", { width: 4000 }),
              createCell("✅", { width: 2500 }),
              createCell("✅（有权限的）", { width: 2500 }),
            ]
          }),
          new TableRow({
            children: [
              createCell("访问子项目", { width: 4000 }),
              createCell("✅", { width: 2500 }),
              createCell("✅（有权限的）", { width: 2500 }),
            ]
          }),
        ]
      }),

      // 四、数据存储
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("四、数据存储")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 存储位置")] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [2500, 2500, 4000],
        rows: [
          createRow(["数据类型", "存储方式", "说明"], true),
          createRow(["用户数据库", "localStorage", "持久化存储，包含所有用户信息"]),
          createRow(["会话信息", "sessionStorage", "当前会话，关闭标签页后清除"]),
          createRow(["跨项目认证", "localStorage", "portal_auth_session，用于子项目验证"]),
          createRow(["主题设置", "localStorage", "用户偏好主题"]),
        ]
      }),

      // 五、安全机制
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("五、安全机制")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 认证机制")] }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("• 密码使用 SHA-256(username:password) 格式哈希存储")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("• 会话 token 固定为 portal_v1_2026")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("• 会话有效期 8 小时")]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 权限控制")] }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("• 所有管理员功能都有权限检查")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("• 普通用户无法访问 admin 标签页")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("• 普通用户无法看到用户管理导航按钮")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("• 数据操作前验证当前用户角色")]
      }),

      // 六、版本历史
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("六、版本历史")] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [1500, 2000, 5500],
        rows: [
          createRow(["版本", "日期", "主要更新"], true),
          createRow(["v1.0", "2026-03-26", "初始版本，基础登录和项目展示"]),
          createRow(["v2.0", "2026-03-26", "用户体系、权限控制、主题切换"]),
          createRow(["v2.1-v2.5", "2026-03-26", "用户管理、子门户认证、联系信息"]),
          createRow(["v2.6-v2.8", "2026-03-26", "界面重构、权限实时生效、修复问题"]),
          createRow(["v2.9", "2026-03-26", "修复权限越权问题"]),
          createRow(["v2.10", "2026-03-26", "修复标签页残留、数据库重复初始化"]),
        ]
      }),

      // 七、使用指南
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("七、使用指南")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.1 管理员操作")] }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("1. 使用 songhw/Seeyon@JD 登录")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun('2. 点击顶部"用户管理"进入管理界面')]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("3. 可添加用户、编辑用户信息、分配项目权限")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun('4. 点击"访问控制"可设置各项目的认证要求')]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.2 普通用户操作")] }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("1. 使用分配的用户名密码登录")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("2. 在项目列表中查看有权限的项目")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun('3. 点击"访问项目"跳转到子项目')]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("4. 点击右上角用户头像可修改个人信息和密码")]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.3 子项目接入")] }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("在子项目 HTML 中引入: <script src=\"https://songhonglu.github.io/projects/portal-auth.js\"></script>")]
      }),

      // 八、技术栈
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("八、技术栈")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("• 前端: 纯 HTML + CSS + JavaScript（无框架）")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("• 存储: localStorage / sessionStorage")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("• 加密: Web Crypto API (SHA-256)")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("• 部署: GitHub Pages")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("• 版本控制: Git")] }),

      // 九、注意事项
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("九、注意事项")] }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("1. 所有数据存储在浏览器本地，清除浏览器数据会丢失用户信息")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("2. 建议使用同一浏览器访问门户和子项目（同域 localStorage 共享）")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun("3. 管理员请妥善保管密码，忘记密码需要手动修改代码重置")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("4. 子项目需开启 CORS 或同域部署才能正常使用跨项目认证")]
      }),

      // 页脚
      new Paragraph({
        spacing: { before: 400 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "—— 文档结束 ——", color: "999999" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "文档生成时间: 2026-03-26    维护人员: 宋老师", size: 18, color: "999999" })]
      }),
    ]
  }]
});

// 生成文档
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("项目门户功能清单.docx", buffer);
  console.log("文档已生成: 项目门户功能清单.docx");
});
