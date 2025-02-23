import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { 
  ShieldCheckIcon, 
  ChartBarIcon, 
  CubeTransparentIcon,
  ArrowPathIcon,
  LockClosedIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const section1 = useScrollAnimation();
  const section2 = useScrollAnimation();
  const section3 = useScrollAnimation();
  const section4 = useScrollAnimation();
  const section5 = useScrollAnimation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 relative z-10"
    >
      <div className="max-w-4xl mx-auto py-16">
        <motion.div
          ref={section1.ref}
          animate={section1.controls}
          initial="hidden"
          variants={section1.variants}
          className="mb-16 backdrop-blur-lg bg-gray-900/50 p-8 rounded-lg"
        >
          <div className="flex items-center gap-4 mb-8">
            <ChartBarIcon className="w-12 h-12 text-purple-500" />
            <h1 className="text-4xl font-bold text-white">DeGrid - USDT/wBTC Grid Trading Vault</h1>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            我們的智能合約 Vault 採用 ERC-4626 標準，讓您可以存入 USDT，並通過自動化的 USDT-wBTC 網格交易策略產生收益。
            智能合約會在不同價格區間自動買進和賣出，讓您能在市場波動中捕捉價差收益。
          </p>
        </motion.div>

        <motion.div
          ref={section2.ref}
          animate={section2.controls}
          initial="hidden"
          variants={section2.variants}
          className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="backdrop-blur-lg bg-gray-900/50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <CubeTransparentIcon className="w-8 h-8 text-purple-500" />
              <h3 className="text-xl font-semibold text-white">去中心化</h3>
            </div>
            <p className="text-gray-300">
              完全去中心化的智能合約操作，沒有中心化控制，資金永遠在您的掌控之中。
            </p>
          </div>

          <div className="backdrop-blur-lg bg-gray-900/50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <DocumentChartBarIcon className="w-8 h-8 text-purple-500" />
              <h3 className="text-xl font-semibold text-white">透明公開</h3>
            </div>
            <p className="text-gray-300">
              所有交易和操作都在鏈上公開可查，策略邏輯開源，確保完全透明。
            </p>
          </div>

          <div className="backdrop-blur-lg bg-gray-900/50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-purple-500" />
              <h3 className="text-xl font-semibold text-white">安全可靠</h3>
            </div>
            <p className="text-gray-300">
              合約採用業界安全標準 ERC-4626，資金安全有保障。
            </p>
          </div>

          <div className="backdrop-blur-lg bg-gray-900/50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <ArrowPathIcon className="w-8 h-8 text-purple-500" />
              <h3 className="text-xl font-semibold text-white">自動化收益</h3>
            </div>
            <p className="text-gray-300">
              全自動化的網格交易策略，24/7 不間斷運作，持續為您賺取收益。
            </p>
          </div>
        </motion.div>

        <motion.div
          ref={section3.ref}
          animate={section3.controls}
          initial="hidden"
          variants={section3.variants}
          className="mb-16 backdrop-blur-lg bg-gray-900/50 p-8 rounded-lg"
        >
          <div className="flex items-center gap-4 mb-6">
            <LockClosedIcon className="w-8 h-8 text-purple-500" />
            <h2 className="text-2xl font-semibold text-white">如何運作</h2>
          </div>
          <div className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              1. 用戶存入 USDT 到智能合約 Vault 中，獲得對應的 vUSDT 代幣作為份額證明。
            </p>
            <p className="leading-relaxed">
              2. Vault 自動在不同價格區間買進和賣出，賺取價差收益。
            </p>
            <p className="leading-relaxed">
              3. 用戶可以隨時提取資金，包含本金和已經賺取的收益。
            </p>
          </div>
        </motion.div>

        <motion.div
          ref={section5.ref}
          animate={section5.controls}
          initial="hidden"
          variants={section5.variants}
          className="mb-16 backdrop-blur-lg bg-gray-900/50 p-8 rounded-lg border border-green-500/20"
        >
          <div className="flex items-center gap-4 mb-6">
            <GiftIcon className="w-8 h-8 text-green-500" />
            <h2 className="text-2xl font-semibold text-white">公益性質專案</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="backdrop-blur-lg bg-gray-800/30 p-6 rounded-lg border border-green-500/10">
              <div className="flex items-center gap-3 mb-4">
                <BanknotesIcon className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-white">零手續費</h3>
              </div>
              <p className="text-gray-300">
                沒有任何手續費，讓您的資金得到最大化利用。
              </p>
            </div>

            <div className="backdrop-blur-lg bg-gray-800/30 p-6 rounded-lg border border-green-500/10">
              <div className="flex items-center gap-3 mb-4">
                <BanknotesIcon className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-white">零管理費</h3>
              </div>
              <p className="text-gray-300">
                不收取任何資產管理費用，您的收益完全歸您所有。
              </p>
            </div>

            <div className="backdrop-blur-lg bg-gray-800/30 p-6 rounded-lg border border-green-500/10">
              <div className="flex items-center gap-3 mb-4">
                <BanknotesIcon className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-white">零抽成</h3>
              </div>
              <p className="text-gray-300">
                所有交易收益 100% 歸於用戶，不抽取任何利潤分成。
              </p>
            </div>
          </div>

          <div className="text-gray-300 leading-relaxed">
            <p className="mb-4">
              DeGrid 是一個完全免費的公益性質智能合約，我們的目標是提供一個安全、透明且無成本的自動化交易解決方案。
            </p>
            <p>
              所有的程式碼都是開源的，我們不會從中獲取任何收益，這是一個純粹服務於社群的專案。
            </p>
          </div>
        </motion.div>

        <motion.div
          ref={section4.ref}
          animate={section4.controls}
          initial="hidden"
          variants={section4.variants}
          className="backdrop-blur-lg bg-gray-900/50 p-8 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">風險提示</h2>
          </div>
          
          <div className="space-y-4 text-gray-300">
            <div className="backdrop-blur-lg bg-gray-800/30 p-6 rounded-lg border border-green-500/10">
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                智能合約風險
              </h3>
              <p className="leading-relaxed">
                雖然我們的合約經過 Review，但仍可能存在未知的漏洞。建議用戶根據自己的風險承受能力進行投資。
              </p>
            </div>

            <div className="backdrop-blur-lg bg-gray-800/30 p-6 rounded-lg border border-green-500/10">
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                市場風險
              </h3>
              <p className="leading-relaxed">
                加密貨幣市場波動劇烈，價格可能急劇上升或下跌。網格交易策略在震盪市場表現較好，但在單向市場仍可能承受損失。
              </p>
            </div>

            <div className="backdrop-blur-lg bg-gray-800/30 p-6 rounded-lg border border-green-500/10">
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                流動性風險
              </h3>
              <p className="leading-relaxed">
                在極端市場條件下，資產可能難以以理想價格交易，這可能影響收益。
              </p>
            </div>

            <div className="backdrop-blur-lg bg-gray-800/30 p-6 rounded-lg border border-green-500/10">
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                策略失效風險
              </h3>
              <p className="leading-relaxed">
                一個失敗的策略仍可能在某段時間內為您帶來收益，但長期來說，這樣的策略是不可持續的。
              </p>
              <p className="leading-relaxed">
                策略成功與否需要經過市場的考驗，我們無法保證策略 100% 賺錢，建議您謹慎投資。
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default About; 