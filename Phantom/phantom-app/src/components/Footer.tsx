import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full px-4 md:px-8 py-16 bg-[#050505] relative z-20 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-20">

                    {/* Column 1 */}
                    <div>
                        <h4 className="text-gray-500 text-xs uppercase font-medium mb-6">меню</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">установка</a></li>
                            <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">форум</a></li>
                            <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">документация</a></li>
                            <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">донат</a></li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h4 className="text-gray-500 text-xs uppercase font-medium mb-6">информация</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">условия использования</a></li>
                            <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">политика конфиденциальности</a></li>
                            <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">безопасность</a></li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h4 className="text-gray-500 text-xs uppercase font-medium mb-6">мы</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">github</a></li>
                            <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">linkedin</a></li>
                        </ul>
                    </div>

                    {/* Column 4 */}
                    <div>
                        <h4 className="text-gray-500 text-xs uppercase font-medium mb-6">связаться с нами</h4>
                        <ul className="space-y-4">
                            <li><a href="mailto:hello@phantom.com" className="text-gray-300 text-sm hover:text-white transition-colors">hello@phantom.com</a></li>
                            <li><a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">@pnm</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8">
                    <div className="text-gray-500 text-xs mb-4 md:mb-0">
                        @ 2025 Phantom, Inc.
                    </div>

                    {/* Language Selector Selector */}
                    <button className="flex items-center gap-2 text-gray-300 text-xs hover:text-white transition-colors">
                        Ru
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
