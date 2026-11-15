"""從 FinMind 抓取財報與三大法人資料,輸出到 data/。
用法:python scripts/fetch_data.py [代號 ...]   (不給代號則處理 constituents.json 全部)
若遇到流量限制,可到 finmindtrade.com 註冊並設定環境變數 FINMIND_TOKEN。"""
import json, os, sys, time, datetime as dt
from collections import defaultdict
import requests

API = "https://api.finmindtrade.com/api/v4/data"
TOKEN = os.getenv("FINMIND_TOKEN", "")

def get(dataset, code, start):
    p = {"dataset": dataset, "data_id": code, "start_date": start}
    if TOKEN: p["token"] = TOKEN
    return requests.get(API, params=p, timeout=30).json().get("data", [])

def quarter(d):
    y, m = int(d[:4]), int(d[5:7])
    return f"{y}Q{(m - 1) // 3 + 1}"

def financials(code):
    rows = get("TaiwanStockFinancialStatements", code, "2023-01-01")
    by = defaultdict(dict)
    for r in rows: by[r["date"]][r["type"]] = r["value"]
    out = []
    for d in sorted(by):
        v = by[d]; rev = v.get("Revenue"); gp = v.get("GrossProfit")
        out.append({"period": quarter(d),
            "revenue": round(rev / 1e8, 2) if rev else None,
            "gross_margin": round(gp / rev * 100, 2) if rev and gp is not None else None,
            "net_income": round(v["IncomeAfterTaxes"] / 1e8, 2) if v.get("IncomeAfterTaxes") is not None else None,
            "eps": v.get("EPS")})
    return {"code": code, "quarters": out}

def chips(code):
    start = (dt.date.today() - dt.timedelta(days=60)).isoformat()
    rows = get("TaiwanStockInstitutionalInvestorsBuySell", code, start)
    grp = {"Foreign_Investor": "foreign", "Foreign_Dealer_Self": "foreign",
           "Investment_Trust": "investment_trust",
           "Dealer_self": "dealer", "Dealer_Hedging": "dealer"}
    by = defaultdict(lambda: {"foreign": 0, "investment_trust": 0, "dealer": 0})
    for r in rows:
        k = grp.get(r["name"])
        if k: by[r["date"]][k] += r["buy"] - r["sell"]
    return {"code": code, "daily": [{"date": d, **by[d]} for d in sorted(by)]}

def main():
    codes = sys.argv[1:] or [c["code"] for c in json.load(open("data/constituents.json", encoding="utf-8"))]
    for c in codes:
        json.dump(financials(c), open(f"data/financials/{c}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        json.dump(chips(c), open(f"data/chips/{c}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print("done", c); time.sleep(1)
    json.dump({"updated_at": dt.date.today().isoformat(), "source": "FinMind(公開資訊觀測站、證交所)"},
              open("data/meta.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()
