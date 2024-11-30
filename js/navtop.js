import { downloadChecked, shareChecked, deleteChecked, uncheckAll, checkAll } from './record-list.js'
import { editNavigation } from './record-details.js'

export function navtop () {
  const listNavs = [
    {
      id: 'delete-selected',
      fn: deleteChecked,
      svgEls: `<path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M80 112h352"/><path d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>`,
      viewBox: "0,0,512,512"
    },
    {
      id: 'download-selected',
      fn: downloadChecked,
      svgEls: `<path d="M336 176h40a40 40 0 0140 40v208a40 40 0 01-40 40H136a40 40 0 01-40-40V216a40 40 0 0140-40h40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M176 272l80 80 80-80M256 48v288"/>`,
      viewBox: "0,0,512,512"
    },
    {
      id: 'share-selected',
      fn: shareChecked,
      svgEls: `<circle cx="128" cy="256" r="48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><circle cx="384" cy="112" r="48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><circle cx="384" cy="400" r="48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M169.83 279.53l172.34 96.94M342.17 135.53l-172.34 96.94"/>`,
      viewBox: "0,0,512,512"
    },
    {
      id: 'select-all',
      fn: checkAll,
      svgEls: `<path d="M0 0 C0.85101288 -0.0087616 1.70202576 -0.01752319 2.5788269 -0.02655029 C5.38510488 -0.0485136 8.18980044 -0.03400286 10.99609375 -0.01708984 C12.94995424 -0.02045887 14.90381269 -0.02531221 16.85766602 -0.03158569 C20.94991028 -0.03895286 25.04160836 -0.02825648 29.13378906 -0.00488281 C34.37652561 0.02360479 39.61798239 0.00719999 44.860672 -0.02274513 C48.89450708 -0.04082228 52.92803928 -0.03505815 56.96188354 -0.02210617 C58.89476676 -0.01877332 60.82767758 -0.022855 62.76052856 -0.03450394 C65.46348792 -0.04721957 68.16438182 -0.02782672 70.8671875 0 C71.66422089 -0.01012115 72.46125427 -0.02024231 73.28244019 -0.03067017 C77.07850042 0.04164657 79.2501557 0.52457876 82.42855835 2.64527893 C85.11624862 6.66896002 85.13993894 9.58143313 85.08056641 14.32104492 C85.089328 15.18341766 85.0980896 16.04579041 85.1071167 16.93429565 C85.12907969 19.77783888 85.11457056 22.61982057 85.09765625 25.46337891 C85.10102497 27.44205524 85.10587806 29.42072955 85.1121521 31.3993988 C85.11951896 35.54291518 85.10882265 39.68589209 85.08544922 43.8293457 C85.05694303 49.14167679 85.07337844 54.45274593 85.10331154 59.76503086 C85.12137357 63.84943667 85.11563181 67.93354289 85.10267258 72.01795769 C85.09933651 73.97678718 85.10343269 75.93564384 85.11507034 77.8944416 C85.12776312 80.6311265 85.10842583 83.36576277 85.08056641 86.10229492 C85.09574814 87.31726402 85.09574814 87.31726402 85.11123657 88.55677795 C85.03732819 92.47328871 84.80189299 94.25524416 82.07406616 97.15660095 C78.97648219 98.90498184 77.14878635 99.06698194 73.62109375 98.89697266 C72.64527344 98.86087891 71.66945313 98.82478516 70.6640625 98.78759766 C69.92800781 98.74119141 69.19195312 98.69478516 68.43359375 98.64697266 C68.48 99.31083984 68.52640625 99.97470703 68.57421875 100.65869141 C68.87151 107.93170945 68.87151 107.93170945 66.55859375 111.70947266 C62.72689951 115.20307623 59.34627289 114.80709083 54.39135742 114.82397461 C53.14475594 114.83383141 53.14475594 114.83383141 51.87297058 114.84388733 C49.11583369 114.86363832 46.35875131 114.87528679 43.6015625 114.88525391 C42.66083704 114.88932943 41.72011158 114.89340496 40.75087929 114.89760399 C35.77199141 114.91847221 30.79313116 114.93277078 25.81420898 114.94213867 C20.66916071 114.95320591 15.5245446 114.98760728 10.37964916 115.02731037 C6.42567638 115.05344421 2.47180707 115.06182762 -1.48224449 115.06542015 C-3.37887173 115.07029433 -5.2754941 115.0819319 -7.17203712 115.10045815 C-9.82703608 115.12478148 -12.48091029 115.12389721 -15.13598633 115.11694336 C-15.91903137 115.12975342 -16.70207642 115.14256348 -17.5088501 115.15576172 C-21.2428896 115.1201261 -23.35772832 114.7810303 -26.5308075 112.74259949 C-30.16432612 109.00193149 -29.72042774 105.65706472 -29.72753906 100.6965332 C-29.73250397 99.87521912 -29.73746887 99.05390503 -29.74258423 98.20770264 C-29.75722237 95.48302378 -29.76401095 92.75840317 -29.76953125 90.03369141 C-29.7752818 88.14280699 -29.78103954 86.25192259 -29.7868042 84.36103821 C-29.7973192 80.3923007 -29.80315845 76.42358347 -29.80664062 72.45483398 C-29.81212326 67.37039749 -29.83614427 62.28622908 -29.86461258 57.20187664 C-29.88324158 53.29422728 -29.88844472 49.38664242 -29.8899765 45.47895241 C-29.89300349 43.60466866 -29.90103357 41.73038607 -29.91416168 39.85614586 C-29.931226 37.23242221 -29.92934095 34.60935241 -29.92285156 31.9855957 C-29.93206635 31.2119014 -29.94128113 30.43820709 -29.95077515 29.6410675 C-29.9158331 25.12874196 -29.34933248 22.23988719 -26.56640625 18.64697266 C-23.64187538 16.62880466 -21.32109449 16.41889359 -17.81640625 16.52197266 C-17.0171875 16.54001953 -16.21796875 16.55806641 -15.39453125 16.57666016 C-14.79125 16.59986328 -14.18796875 16.62306641 -13.56640625 16.64697266 C-13.65341797 15.54289062 -13.65341797 15.54289062 -13.7421875 14.41650391 C-13.78730469 13.44068359 -13.83242188 12.46486328 -13.87890625 11.45947266 C-13.93691406 10.49654297 -13.99492187 9.53361328 -14.0546875 8.54150391 C-12.75718763 0.84992465 -6.7416706 -0.08560933 0 0 Z M-5.56640625 7.64697266 C-5.56640625 10.61697266 -5.56640625 13.58697266 -5.56640625 16.64697266 C-4.73590759 16.65505951 -3.90540894 16.66314636 -3.04974365 16.67147827 C4.77813229 16.74942917 12.60583637 16.83672137 20.43349075 16.93449974 C24.45774134 16.98443893 28.48196598 17.03076911 32.50634766 17.06884766 C36.39033025 17.10573061 40.27409452 17.15209861 44.15789032 17.20503616 C45.63940347 17.22356414 47.1209634 17.23867802 48.60254669 17.25031662 C50.67829225 17.26720668 52.75353955 17.29624736 54.82910156 17.328125 C56.01046692 17.34144867 57.19183228 17.35477234 58.40899658 17.36849976 C61.37482546 17.64156189 63.02969305 17.91999113 65.43359375 19.64697266 C67.83454172 22.98901218 67.70706797 26.22835392 67.75244141 30.25146484 C67.76248703 30.90553818 67.77253265 31.55961151 67.78288269 32.23350525 C67.81367609 34.3869441 67.83073871 36.54025885 67.84765625 38.69384766 C67.86637104 40.1902981 67.88594469 41.68673804 67.90634155 43.1831665 C67.95763613 47.11547643 67.99727603 51.04782057 68.03448486 54.98028564 C68.07454136 58.99556928 68.12562618 63.01071096 68.17578125 67.02587891 C68.27250883 74.8994798 68.35692362 82.77315103 68.43359375 90.64697266 C71.40359375 90.64697266 74.37359375 90.64697266 77.43359375 90.64697266 C77.45671703 79.97277567 77.47450876 69.2985846 77.48540592 58.62436771 C77.49063478 53.66843344 77.49773249 48.71251624 77.5090332 43.7565918 C77.51986197 38.9779843 77.52587056 34.19939328 77.52847099 29.42077446 C77.53032526 27.59343646 77.53394591 25.76609941 77.53932381 23.93876839 C77.54653411 21.38843937 77.5475847 18.83817929 77.54711914 16.2878418 C77.55251205 15.14309387 77.55251205 15.14309387 77.55801392 13.97521973 C77.86495615 10.52155102 77.86495615 10.52155102 76.43359375 7.64697266 C73.87769487 7.55191214 71.34891403 7.52140504 68.79272461 7.53344727 C67.9927858 7.53330124 67.19284698 7.53315521 66.3686676 7.53300476 C63.7118971 7.5337041 61.05519582 7.54149747 58.3984375 7.54931641 C56.56140684 7.55118051 54.72437569 7.55260445 52.88734436 7.55360413 C48.04249713 7.55742991 43.19767967 7.5672607 38.35284424 7.57830811 C33.41296797 7.58852094 28.4730869 7.59310147 23.53320312 7.59814453 C13.83332022 7.60888291 4.13345946 7.62596005 -5.56640625 7.64697266 Z M-21.50796509 24.70541382 C-23.15387701 27.7246037 -22.98310068 30.74858553 -22.95458984 34.10009766 C-22.9598468 34.85649536 -22.96510376 35.61289307 -22.97052002 36.39221191 C-22.98373039 38.89400851 -22.97497857 41.39516952 -22.96484375 43.89697266 C-22.96686419 45.63427859 -22.96977539 47.37158369 -22.97354126 49.10888672 C-22.97796601 52.75057039 -22.97152879 56.39203337 -22.95751953 60.03369141 C-22.94042747 64.7047075 -22.95026786 69.3752065 -22.96823692 74.04620361 C-22.97907074 77.63382879 -22.97563029 81.22133111 -22.96785355 84.80895996 C-22.96585042 86.53137269 -22.96831475 88.25379653 -22.97529221 89.97619629 C-22.9829002 92.38238121 -22.97131237 94.78772545 -22.95458984 97.19384766 C-22.96066254 97.9077063 -22.96673523 98.62156494 -22.97299194 99.35705566 C-22.93801595 102.06969369 -22.81861029 104.18636452 -21.50222778 106.59051514 C-18.50786615 108.22466158 -15.52815094 108.04688291 -12.20507812 108.00341797 C-11.45843399 108.00546234 -10.71178986 108.00750671 -9.94252014 108.00961304 C-7.47315014 108.01262244 -5.00444696 107.99413911 -2.53515625 107.97509766 C-0.82027349 107.97204007 0.89461175 107.97016395 2.60949707 107.96942139 C6.20411682 107.96481726 9.79851267 107.95038762 13.39306641 107.92822266 C18.00340228 107.89994026 22.61356175 107.88901117 27.22397614 107.88454056 C30.76525644 107.88038563 34.306501 107.87056752 37.84776306 107.85866547 C39.54784357 107.85296357 41.2479275 107.84820459 42.94801331 107.8443985 C45.32282556 107.83753142 47.69749803 107.82389679 50.07226562 107.80810547 C50.77677353 107.80698761 51.48128143 107.80586975 52.20713806 107.80471802 C55.22720085 107.77809216 57.5434662 107.61034851 60.43359375 106.64697266 C61.60663806 103.12783974 61.58891626 99.94746954 61.59472656 96.28564453 C61.59969147 95.5390004 61.60465637 94.79235626 61.60977173 94.02308655 C61.62437382 91.55395588 61.63119086 89.0848894 61.63671875 86.61572266 C61.6424703 84.9008382 61.64822804 83.18595376 61.6539917 81.47106934 C61.66449507 77.87654317 61.67034258 74.28203935 61.67382812 70.6875 C61.67932194 66.07706797 61.70337151 61.46692992 61.73180008 56.85659027 C61.75040041 53.3153191 61.75563058 49.77411925 61.757164 46.23280334 C61.76019523 44.53270352 61.76823956 42.83260508 61.78134918 41.1325531 C61.79836118 38.75757248 61.79654205 36.38331722 61.79003906 34.00830078 C61.79925385 33.30379288 61.80846863 32.59928497 61.81796265 31.87342834 C61.79483181 29.18337099 61.67901075 27.09666752 60.37713623 24.71115112 C57.35805661 23.05806684 54.33470373 23.23025507 50.98046875 23.25878906 C50.22407104 23.2535321 49.46767334 23.24827515 48.68835449 23.24285889 C46.18655789 23.22964852 43.68539689 23.23840033 41.18359375 23.24853516 C39.44628782 23.24651471 37.70898271 23.24360352 35.97167969 23.23983765 C32.32999601 23.2354129 28.68853303 23.24185012 25.046875 23.25585938 C20.37585891 23.27295144 15.70535991 23.26311105 11.03436279 23.24514198 C7.44673762 23.23430816 3.8592353 23.23774862 0.27160645 23.24552536 C-1.45080628 23.24752848 -3.17323012 23.24506416 -4.89562988 23.2380867 C-7.3018148 23.2304787 -9.70715905 23.24206653 -12.11328125 23.25878906 C-12.82713989 23.25271637 -13.54099854 23.24664368 -14.27648926 23.24038696 C-16.98543222 23.27531531 -19.10484302 23.39535138 -21.50796509 24.70541382 Z " transform="translate(36.56640625,7.35302734375)"/>
        <path d="M0 0 C2 1.6875 2 1.6875 3 4 C2.72116398 9.27587099 1.001788 11.63864137 -2.625 15.375 C-3.54741919 16.34453463 -4.46929269 17.31458872 -5.390625 18.28515625 C-6.68226562 19.62900391 -6.68226562 19.62900391 -8 21 C-9.13553377 22.26142991 -10.26184944 23.53127473 -11.375 24.8125 C-11.91769531 25.43640625 -12.46039063 26.0603125 -13.01953125 26.703125 C-16.7007451 30.97246177 -20.36988833 35.25212607 -24.03515625 39.53515625 C-24.52048828 40.09912109 -25.00582031 40.66308594 -25.50585938 41.24414062 C-26.54598146 42.46645403 -27.5723843 43.70051952 -28.58789062 44.94335938 C-29.10673828 45.57177734 -29.62558594 46.20019531 -30.16015625 46.84765625 C-30.62429932 47.4187915 -31.08844238 47.98992676 -31.56665039 48.57836914 C-33 50 -33 50 -36.375 51.375 C-41.81638124 50.81209849 -44.28381949 47.79140683 -48 44 C-48.59554687 43.4740625 -49.19109375 42.948125 -49.8046875 42.40625 C-52.44015132 40.03559355 -53.91256442 38.27323619 -55 34.875 C-55 31.87791965 -54.71250214 30.43355567 -53 28 C-49.86128812 26.43064406 -47.46144178 26.64798897 -44 27 C-41.0625 29.5 -41.0625 29.5 -39 32 C-35.95763286 30.66240755 -34.12375002 29.29407555 -32 26.75 C-31.401875 26.04359375 -30.80375 25.3371875 -30.1875 24.609375 C-29.465625 23.74828125 -28.74375 22.8871875 -28 22 C-26.00465325 19.66267456 -24.00184109 17.33176383 -22 15 C-20.96083129 13.78785146 -19.92176673 12.57561363 -18.8828125 11.36328125 C-18.38942383 10.78787598 -17.89603516 10.2124707 -17.38769531 9.61962891 C-16.1709842 8.19956178 -14.95641036 6.77766403 -13.7421875 5.35546875 C-13.12601563 4.64003906 -12.50984375 3.92460938 -11.875 3.1875 C-11.35679688 2.58292969 -10.83859375 1.97835937 -10.3046875 1.35546875 C-7.14044843 -1.93192932 -4.17294541 -0.95172439 0 0 Z " transform="translate(82,48)"/>`,
      viewBox: "0,0,130,130"
    },
    {
      id: 'deselect-all',
      fn: uncheckAll,
      svgEls: `<path d="M0 0 C0.85101288 -0.0087616 1.70202576 -0.01752319 2.5788269 -0.02655029 C5.38510488 -0.0485136 8.18980044 -0.03400286 10.99609375 -0.01708984 C12.94995424 -0.02045887 14.90381269 -0.02531221 16.85766602 -0.03158569 C20.94991028 -0.03895286 25.04160836 -0.02825648 29.13378906 -0.00488281 C34.37652561 0.02360479 39.61798239 0.00719999 44.860672 -0.02274513 C48.89450708 -0.04082228 52.92803928 -0.03505815 56.96188354 -0.02210617 C58.89476676 -0.01877332 60.82767758 -0.022855 62.76052856 -0.03450394 C65.46348792 -0.04721957 68.16438182 -0.02782672 70.8671875 0 C71.66422089 -0.01012115 72.46125427 -0.02024231 73.28244019 -0.03067017 C77.07850042 0.04164657 79.2501557 0.52457876 82.42855835 2.64527893 C85.11624862 6.66896002 85.13993894 9.58143313 85.08056641 14.32104492 C85.089328 15.18341766 85.0980896 16.04579041 85.1071167 16.93429565 C85.12907969 19.77783888 85.11457056 22.61982057 85.09765625 25.46337891 C85.10102497 27.44205524 85.10587806 29.42072955 85.1121521 31.3993988 C85.11951896 35.54291518 85.10882265 39.68589209 85.08544922 43.8293457 C85.05694303 49.14167679 85.07337844 54.45274593 85.10331154 59.76503086 C85.12137357 63.84943667 85.11563181 67.93354289 85.10267258 72.01795769 C85.09933651 73.97678718 85.10343269 75.93564384 85.11507034 77.8944416 C85.12776312 80.6311265 85.10842583 83.36576277 85.08056641 86.10229492 C85.09574814 87.31726402 85.09574814 87.31726402 85.11123657 88.55677795 C85.03732819 92.47328871 84.80189299 94.25524416 82.07406616 97.15660095 C78.97648219 98.90498184 77.14878635 99.06698194 73.62109375 98.89697266 C72.64527344 98.86087891 71.66945313 98.82478516 70.6640625 98.78759766 C69.92800781 98.74119141 69.19195312 98.69478516 68.43359375 98.64697266 C68.48 99.31083984 68.52640625 99.97470703 68.57421875 100.65869141 C68.87151 107.93170945 68.87151 107.93170945 66.55859375 111.70947266 C62.72689951 115.20307623 59.34627289 114.80709083 54.39135742 114.82397461 C53.14475594 114.83383141 53.14475594 114.83383141 51.87297058 114.84388733 C49.11583369 114.86363832 46.35875131 114.87528679 43.6015625 114.88525391 C42.66083704 114.88932943 41.72011158 114.89340496 40.75087929 114.89760399 C35.77199141 114.91847221 30.79313116 114.93277078 25.81420898 114.94213867 C20.66916071 114.95320591 15.5245446 114.98760728 10.37964916 115.02731037 C6.42567638 115.05344421 2.47180707 115.06182762 -1.48224449 115.06542015 C-3.37887173 115.07029433 -5.2754941 115.0819319 -7.17203712 115.10045815 C-9.82703608 115.12478148 -12.48091029 115.12389721 -15.13598633 115.11694336 C-15.91903137 115.12975342 -16.70207642 115.14256348 -17.5088501 115.15576172 C-21.2428896 115.1201261 -23.35772832 114.7810303 -26.5308075 112.74259949 C-30.16432612 109.00193149 -29.72042774 105.65706472 -29.72753906 100.6965332 C-29.73250397 99.87521912 -29.73746887 99.05390503 -29.74258423 98.20770264 C-29.75722237 95.48302378 -29.76401095 92.75840317 -29.76953125 90.03369141 C-29.7752818 88.14280699 -29.78103954 86.25192259 -29.7868042 84.36103821 C-29.7973192 80.3923007 -29.80315845 76.42358347 -29.80664062 72.45483398 C-29.81212326 67.37039749 -29.83614427 62.28622908 -29.86461258 57.20187664 C-29.88324158 53.29422728 -29.88844472 49.38664242 -29.8899765 45.47895241 C-29.89300349 43.60466866 -29.90103357 41.73038607 -29.91416168 39.85614586 C-29.931226 37.23242221 -29.92934095 34.60935241 -29.92285156 31.9855957 C-29.93206635 31.2119014 -29.94128113 30.43820709 -29.95077515 29.6410675 C-29.9158331 25.12874196 -29.34933248 22.23988719 -26.56640625 18.64697266 C-23.64187538 16.62880466 -21.32109449 16.41889359 -17.81640625 16.52197266 C-17.0171875 16.54001953 -16.21796875 16.55806641 -15.39453125 16.57666016 C-14.79125 16.59986328 -14.18796875 16.62306641 -13.56640625 16.64697266 C-13.65341797 15.54289062 -13.65341797 15.54289062 -13.7421875 14.41650391 C-13.78730469 13.44068359 -13.83242188 12.46486328 -13.87890625 11.45947266 C-13.93691406 10.49654297 -13.99492187 9.53361328 -14.0546875 8.54150391 C-12.75718763 0.84992465 -6.7416706 -0.08560933 0 0 Z M-5.56640625 7.64697266 C-5.56640625 10.61697266 -5.56640625 13.58697266 -5.56640625 16.64697266 C-4.73590759 16.65505951 -3.90540894 16.66314636 -3.04974365 16.67147827 C4.77813229 16.74942917 12.60583637 16.83672137 20.43349075 16.93449974 C24.45774134 16.98443893 28.48196598 17.03076911 32.50634766 17.06884766 C36.39033025 17.10573061 40.27409452 17.15209861 44.15789032 17.20503616 C45.63940347 17.22356414 47.1209634 17.23867802 48.60254669 17.25031662 C50.67829225 17.26720668 52.75353955 17.29624736 54.82910156 17.328125 C56.01046692 17.34144867 57.19183228 17.35477234 58.40899658 17.36849976 C61.37482546 17.64156189 63.02969305 17.91999113 65.43359375 19.64697266 C67.83454172 22.98901218 67.70706797 26.22835392 67.75244141 30.25146484 C67.76248703 30.90553818 67.77253265 31.55961151 67.78288269 32.23350525 C67.81367609 34.3869441 67.83073871 36.54025885 67.84765625 38.69384766 C67.86637104 40.1902981 67.88594469 41.68673804 67.90634155 43.1831665 C67.95763613 47.11547643 67.99727603 51.04782057 68.03448486 54.98028564 C68.07454136 58.99556928 68.12562618 63.01071096 68.17578125 67.02587891 C68.27250883 74.8994798 68.35692362 82.77315103 68.43359375 90.64697266 C71.40359375 90.64697266 74.37359375 90.64697266 77.43359375 90.64697266 C77.45671703 79.97277567 77.47450876 69.2985846 77.48540592 58.62436771 C77.49063478 53.66843344 77.49773249 48.71251624 77.5090332 43.7565918 C77.51986197 38.9779843 77.52587056 34.19939328 77.52847099 29.42077446 C77.53032526 27.59343646 77.53394591 25.76609941 77.53932381 23.93876839 C77.54653411 21.38843937 77.5475847 18.83817929 77.54711914 16.2878418 C77.55251205 15.14309387 77.55251205 15.14309387 77.55801392 13.97521973 C77.86495615 10.52155102 77.86495615 10.52155102 76.43359375 7.64697266 C73.87769487 7.55191214 71.34891403 7.52140504 68.79272461 7.53344727 C67.9927858 7.53330124 67.19284698 7.53315521 66.3686676 7.53300476 C63.7118971 7.5337041 61.05519582 7.54149747 58.3984375 7.54931641 C56.56140684 7.55118051 54.72437569 7.55260445 52.88734436 7.55360413 C48.04249713 7.55742991 43.19767967 7.5672607 38.35284424 7.57830811 C33.41296797 7.58852094 28.4730869 7.59310147 23.53320312 7.59814453 C13.83332022 7.60888291 4.13345946 7.62596005 -5.56640625 7.64697266 Z M-21.50796509 24.70541382 C-23.15387701 27.7246037 -22.98310068 30.74858553 -22.95458984 34.10009766 C-22.9598468 34.85649536 -22.96510376 35.61289307 -22.97052002 36.39221191 C-22.98373039 38.89400851 -22.97497857 41.39516952 -22.96484375 43.89697266 C-22.96686419 45.63427859 -22.96977539 47.37158369 -22.97354126 49.10888672 C-22.97796601 52.75057039 -22.97152879 56.39203337 -22.95751953 60.03369141 C-22.94042747 64.7047075 -22.95026786 69.3752065 -22.96823692 74.04620361 C-22.97907074 77.63382879 -22.97563029 81.22133111 -22.96785355 84.80895996 C-22.96585042 86.53137269 -22.96831475 88.25379653 -22.97529221 89.97619629 C-22.9829002 92.38238121 -22.97131237 94.78772545 -22.95458984 97.19384766 C-22.96066254 97.9077063 -22.96673523 98.62156494 -22.97299194 99.35705566 C-22.93801595 102.06969369 -22.81861029 104.18636452 -21.50222778 106.59051514 C-18.50786615 108.22466158 -15.52815094 108.04688291 -12.20507812 108.00341797 C-11.45843399 108.00546234 -10.71178986 108.00750671 -9.94252014 108.00961304 C-7.47315014 108.01262244 -5.00444696 107.99413911 -2.53515625 107.97509766 C-0.82027349 107.97204007 0.89461175 107.97016395 2.60949707 107.96942139 C6.20411682 107.96481726 9.79851267 107.95038762 13.39306641 107.92822266 C18.00340228 107.89994026 22.61356175 107.88901117 27.22397614 107.88454056 C30.76525644 107.88038563 34.306501 107.87056752 37.84776306 107.85866547 C39.54784357 107.85296357 41.2479275 107.84820459 42.94801331 107.8443985 C45.32282556 107.83753142 47.69749803 107.82389679 50.07226562 107.80810547 C50.77677353 107.80698761 51.48128143 107.80586975 52.20713806 107.80471802 C55.22720085 107.77809216 57.5434662 107.61034851 60.43359375 106.64697266 C61.60663806 103.12783974 61.58891626 99.94746954 61.59472656 96.28564453 C61.59969147 95.5390004 61.60465637 94.79235626 61.60977173 94.02308655 C61.62437382 91.55395588 61.63119086 89.0848894 61.63671875 86.61572266 C61.6424703 84.9008382 61.64822804 83.18595376 61.6539917 81.47106934 C61.66449507 77.87654317 61.67034258 74.28203935 61.67382812 70.6875 C61.67932194 66.07706797 61.70337151 61.46692992 61.73180008 56.85659027 C61.75040041 53.3153191 61.75563058 49.77411925 61.757164 46.23280334 C61.76019523 44.53270352 61.76823956 42.83260508 61.78134918 41.1325531 C61.79836118 38.75757248 61.79654205 36.38331722 61.79003906 34.00830078 C61.79925385 33.30379288 61.80846863 32.59928497 61.81796265 31.87342834 C61.79483181 29.18337099 61.67901075 27.09666752 60.37713623 24.71115112 C57.35805661 23.05806684 54.33470373 23.23025507 50.98046875 23.25878906 C50.22407104 23.2535321 49.46767334 23.24827515 48.68835449 23.24285889 C46.18655789 23.22964852 43.68539689 23.23840033 41.18359375 23.24853516 C39.44628782 23.24651471 37.70898271 23.24360352 35.97167969 23.23983765 C32.32999601 23.2354129 28.68853303 23.24185012 25.046875 23.25585938 C20.37585891 23.27295144 15.70535991 23.26311105 11.03436279 23.24514198 C7.44673762 23.23430816 3.8592353 23.23774862 0.27160645 23.24552536 C-1.45080628 23.24752848 -3.17323012 23.24506416 -4.89562988 23.2380867 C-7.3018148 23.2304787 -9.70715905 23.24206653 -12.11328125 23.25878906 C-12.82713989 23.25271637 -13.54099854 23.24664368 -14.27648926 23.24038696 C-16.98543222 23.27531531 -19.10484302 23.39535138 -21.50796509 24.70541382 Z " fill="#000000" transform="translate(36.56640625,7.35302734375)"/>`,
      viewBox: "0,0,130,130"
    },
  ]

  const editNavs = [
    {
      id: 'edit-record',
      div: 'record-details',
      svgEls: `<path d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M459.94 53.25a16.06 16.06 0 00-23.22-.56L424.35 65a8 8 0 000 11.31l11.34 11.32a8 8 0 0011.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38zM399.34 90L218.82 270.2a9 9 0 00-2.31 3.93L208.16 299a3.91 3.91 0 004.86 4.86l24.85-8.35a9 9 0 003.93-2.31L422 112.66a9 9 0 000-12.66l-9.95-10a9 9 0 00-12.71 0z"/>`,
      viewBox: "0,0,512,512"
    },
    {
      id: 'edit-taxa',
      div: 'taxa-details',
      svgEls: `<path d="M370 378c28.89 23.52 46 46.07 46 86M142 378c-28.89 23.52-46 46.06-46 86M384 208c28.89-23.52 32-56.07 32-96M128 206c-28.89-23.52-32-54.06-32-94M464 288.13h-80M128 288.13H48M256 192v256" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M256 448h0c-70.4 0-128-57.6-128-128v-96.07c0-65.07 57.6-96 128-96h0c70.4 0 128 25.6 128 96V320c0 70.4-57.6 128-128 128z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M179.43 143.52a49.08 49.08 0 01-3.43-15.73A80 80 0 01255.79 48h.42A80 80 0 01336 127.79a41.91 41.91 0 01-3.12 14.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>`,
      viewBox: "0,0,512,512"
    },
     {
      id: 'edit-metadata',
      div: 'metadata-details',
      svgEls: `<path d="M403.29 32H280.36a14.46 14.46 0 00-10.2 4.2L24.4 281.9a28.85 28.85 0 000 40.7l117 117a28.86 28.86 0 0040.71 0L427.8 194a14.46 14.46 0 004.2-10.2v-123A28.66 28.66 0 00403.29 32z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M352 144a32 32 0 1132-32 32 32 0 01-32 32z"/><path d="M230 480l262-262a13.81 13.81 0 004-10V80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>`,
      viewBox: "0,0,512,512"
    }
  ]



  // Note length of paths above screws up VB colouring

  const navtop = document.getElementById('navtop')
  let navContainer
  
  navContainer = document.createElement('div')
  navContainer.setAttribute('class', 'navtop-inner-container left')
  navtop.appendChild(navContainer)
  const navtopInnerLeft = document.createElement('div')
  navtopInnerLeft.setAttribute('id', 'navtop-inner-left')
  navContainer.appendChild(navtopInnerLeft)

  navContainer = document.createElement('div')
  navContainer.setAttribute('class', 'navtop-inner-container middle')
  navtop.appendChild(navContainer)
  const navtopInnerMiddle = document.createElement('div')
  navtopInnerMiddle.setAttribute('id', 'navtop-inner-middle')
  navContainer.appendChild(navtopInnerMiddle)

  navContainer = document.createElement('div')
  navContainer.setAttribute('class', 'navtop-inner-container right')
  navtop.appendChild(navContainer)
  const navtopInnerRight = document.createElement('div')
  navtopInnerRight.setAttribute('id', 'navtop-inner-right')
  navContainer.appendChild(navtopInnerRight)

  listNavs.forEach(n => {
    const div = document.createElement('div')
    div.addEventListener('click', n.fn)
    navtopInnerLeft.appendChild(div)
    // See comment in navbot.js for reason why below isn't built dynamically
    div.innerHTML = `<svg id="${n.id}" viewBox="${n.viewBox}" class="nabvar-icon">${n.svgEls}</svg>`
  })

  editNavs.forEach(n => {
    const div = document.createElement('div')
    div.classList.add('edit-nav')
    if(n.id === sessionStorage.getItem('topNav')) {
      div.classList.add('selected-nav')
    }
    navtopInnerRight.appendChild(div)
    // See comment in navbot.js for reason why below isn't built dynamically
    div.innerHTML = `<svg id="${n.id}" data-div="${n.div}" viewBox="${n.viewBox}" class="nabvar-icon">${n.svgEls}</svg>`

    // Handle highlighting of clicked div
    div.addEventListener('click', function(e){
      sessionStorage.setItem('topNav', e.target.id)
      // Take selected class off all divs
      const navs = document.getElementsByClassName("edit-nav")
      for (let i = 0; i < navs.length; i++) {
        navs[i].classList.remove('selected-nav')
      }
      // Add selected class to the clicked div
      div.classList.add('selected-nav')

      editNavigation()
    })
    // Handle displaying the correct content div
    //div.addEventListener('click', editNavigation)
  })
}