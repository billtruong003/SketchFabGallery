import requests
import json
import time
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def get_model_info(model_id, api_token, output_file, model_info_list, processed_count):
    """
    Lấy thông tin model từ Sketchfab Data API dựa trên model ID.
    Trả về thông tin model, danh sách model đã lấy, số model đã xử lý và response.
    Nếu gặp lỗi 429, lưu file và thông báo.
    Nếu gặp lỗi khác, trả về None cho model_info và response để bỏ qua model.

    Args:
        model_id (str): ID của model.
        api_token (str): Sketchfab API token.
        output_file (str): Tên file để lưu thông tin model.
        model_info_list (list): Danh sách thông tin model đã lấy được.
        processed_count (int): Số model đã xử lý.

    Returns:
        tuple: (model_info, model_info_list, processed_count, response)
               model_info là thông tin model nếu lấy thành công, None nếu có lỗi khác 429.
               model_info_list và processed_count được cập nhật khi gặp lỗi 429.
               response chứa response từ API, có thể là None nếu lỗi từ phía client.
    """
    url = f"https://api.sketchfab.com/v3/models/{model_id}"
    headers = {"Authorization": f"Token {api_token}"}
    response = None

    # Cấu hình retry (vẫn giữ nguyên để xử lý các lỗi khác)
    retry_strategy = Retry(
        total=3,
        status_forcelist=[429],
        allowed_methods=["GET"],
        backoff_factor=1,
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    http = requests.Session()
    http.mount("https://", adapter)
    http.mount("http://", adapter)

    try:
        response = http.get(url, headers=headers)
        response.raise_for_status()

        data = response.json()
        print(data)

        model_info = {
            "title": data["name"],
            "author": data["user"]["displayName"],
            "url": data["embedUrl"],
            "authorUrl": data["user"]["profileUrl"],
            "sketchfabUrl": "https://sketchfab.com",
            "downloadLink": None,
        }

        for format in data.get("download", []):
            if format["format"] == "glb":
                model_info["downloadLink"] = format["url"]
                break
            elif model_info["downloadLink"] is None:
                model_info["downloadLink"] = format["url"]

        return model_info, model_info_list, processed_count, response

    except requests.exceptions.RequestException as e:
        if response and response.status_code == 429:  # Kiểm tra rate limit
            print(f"Gặp lỗi rate limit (429) khi lấy thông tin model {model_id}")
            print(f"Đã xử lý được {processed_count} models.")
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(model_info_list, f, indent=4, ensure_ascii=False)
            print(f"Đã lưu thông tin (tính đến model hiện tại) vào file {output_file}")
            return None, model_info_list, processed_count, response
        else:
            print(f"Lỗi khi lấy thông tin model {model_id}: {e}")
            if response:
                print(f"Status code: {response.status_code}, Response: {response.text}")
            return None, model_info_list, processed_count, response  # Trả về None cho model_info và response

def process_model_urls(json_file, api_token, start_number, output_file="model_info.json"):
    """
    Đọc file JSON chứa các URL, lấy thông tin chi tiết qua API và lưu vào file mới.

    Args:
        json_file (str): Đường dẫn đến file JSON chứa danh sách các URL.
        api_token (str): Sketchfab API token.
        start_number (int): Số thứ tự model bắt đầu xử lý.
        output_file (str): Tên file để lưu thông tin model.
    """
    try:
        with open(json_file, "r") as f:
            model_urls = json.load(f)
    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file {json_file}")
        return
    except json.JSONDecodeError:
        print(f"Lỗi: File {json_file} không đúng định dạng JSON.")
        return
    
    # Bắt đầu từ vị trí start_number
    model_urls = model_urls[start_number:]

    model_info_list = []
    processed_count = start_number
    response = None

    for i, url in enumerate(model_urls):
        model_id = url.split('-')[-1]
        print(f"Đang lấy thông tin cho model: {url} (ID: {model_id})")
        print(f"Đã xử lý được {processed_count}/{len(model_urls) + start_number} models.") # Điều chỉnh log cho đúng

        model_info, model_info_list, processed_count, response = get_model_info(model_id, api_token, output_file, model_info_list, processed_count)

        if model_info is None:
            if response and response.status_code == 429:
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(model_info_list, f, indent=4, ensure_ascii=False)
                print(f"Đã lưu thông tin vào file {output_file}")
                print("Thoát chương trình do gặp lỗi 429.")
                return  # Thoát khỏi hàm process_model_urls
            else:
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(model_info_list, f, indent=4, ensure_ascii=False)
                print(f"Đã lưu thông tin vào file {output_file}")
                print(f"Bỏ qua model: {url} do lỗi {response.status_code}")
        
        if model_info:
            model_info_list.append(model_info)
            processed_count += 1
        
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(model_info_list, f, indent=4, ensure_ascii=False)
    print(f"Đã lưu thông tin vào file {output_file}")

# Thay thế bằng API token của bạn
api_token = "b49a9a936123496b865f9dc976acc43d"
# Thay thế bằng đường dẫn đến file JSON chứa các URL
json_file = "featured_models.json"
start_number = 1896  # Bắt đầu từ model thứ 42
process_model_urls(json_file, api_token, start_number)